import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt

import warnings

# Helper to load simple .env file without external dependencies
def load_env(dotenv_path):
    if os.path.exists(dotenv_path):
        try:
            with open(dotenv_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        parts = line.split('=', 1)
                        if len(parts) == 2:
                            key, val = parts
                            os.environ[key.strip()] = val.strip().strip('"').strip("'")
        except Exception as e:
            print(f"Error loading .env file: {e}")

# Load environment from project root (.env resides in parent folder of backend)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
load_env(os.path.join(PROJECT_ROOT, ".env"))

# Secret keys and settings
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    warnings.warn(
        "SECRET_KEY environment variable is not set. "
        "Using a temporary insecure default key for local development."
    )
    SECRET_KEY = "insecure_dev_fallback_key_do_not_use_in_production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours to keep the session alive easily for clinical trials/testing

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
