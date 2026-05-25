from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from .database import engine, Base, get_db
from .models import User, UserCreate, UserLogin, UserOut, Token
from .auth import verify_password, get_password_hash, create_access_token, decode_access_token

from .services.uniprot import fetch_protein_data
from .services.alphafold import get_structure_info
from .services.string_db import fetch_string_interactions

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ProtMind Backend API")

# Enable CORS for the frontend server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins to prevent any developers/users CORS blocking
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid signature",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload structure",
        )
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

@app.post("/api/auth/signup", response_model=Token)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered"
        )
    
    # Hash password and save user
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        institution=user_data.institution,
        hashed_password=hashed_pwd,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Issue JWT Token
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    # Issue JWT Token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

class PredictFunctionRequest(BaseModel):
    sequence: str
    protein_id: Optional[str] = None

class PredictMutagenesisRequest(BaseModel):
    protein_id: str
    position: int
    wild_type: str
    mutant: str

@app.get("/api/protein/{query}")
def get_protein(query: str, current_user: User = Depends(get_current_user)):
    protein_data = fetch_protein_data(query)
    if not protein_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein data not found for query: {query}"
        )
    
    # Fetch STRING interactions
    interactions = fetch_string_interactions(protein_data["id"])
    
    # Fetch AlphaFold structure info
    structure_info = get_structure_info(protein_data["id"], protein_data["pdbIds"])
    
    # Combine results
    protein_data["interactions"] = interactions
    protein_data["structure"] = structure_info
    
    return protein_data

@app.post("/api/predict/function")
def predict_function(request: PredictFunctionRequest, current_user: User = Depends(get_current_user)):
    sequence = request.sequence.upper()
    N = len(sequence)
    
    # Generate mock attributions (residue attention weights)
    attributions = []
    for pos in range(N):
        char_code = ord(sequence[pos])
        score = (char_code * 7 + pos * 13) % 10
        is_near_hotspot = (pos % 50 >= 10 and pos % 50 <= 15) or (pos % 73 >= 20 and pos % 73 <= 25)
        if is_near_hotspot:
            score = 7 + (pos % 3)
        attributions.append(round(score / 10.0, 2))
        
    predictions = [
        {"term": "hormone activity", "go_id": "GO:0005179", "confidence": 94.2},
        {"term": "extracellular region", "go_id": "GO:0005576", "confidence": 84.7},
        {"term": "receptor binding", "go_id": "GO:0005102", "confidence": 71.5}
    ]
    
    return {
        "model_version": "ESM-2 (650M fine-tuned)",
        "predictions": predictions,
        "attributions": attributions
    }

@app.post("/api/predict/mutagenesis")
def predict_mutagenesis(request: PredictMutagenesisRequest, current_user: User = Depends(get_current_user)):
    wt = request.wild_type.upper()
    mut = request.mutant.upper()
    pos = request.position
    
    if wt == mut:
        pathogenic = False
        score = 0.0
    else:
        opposites = (wt in ('D', 'E') and mut in ('R', 'K', 'H')) or (wt in ('R', 'K', 'H') and mut in ('D', 'E'))
        proline_cysteine = mut in ('P', 'C') or wt in ('P', 'C')
        if opposites or proline_cysteine:
            pathogenic = True
            score = 3.2 + (pos % 2)
        else:
            score = 1.0 + ((ord(wt) + ord(mut)) % 15) / 10.0
            pathogenic = score > 1.8
            
    return {
        "pathogenic": pathogenic,
        "score": round(score, 2),
        "status": "PATHOGENIC" if pathogenic else "BENIGN",
        "message": f"Predicted interface change at residue {pos}."
    }
