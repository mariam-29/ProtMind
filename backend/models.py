from sqlalchemy import Column, Integer, String
from pydantic import BaseModel, EmailStr
from typing import Optional
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    institution = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Researcher", nullable=False)

# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    institution: Optional[str] = None
    role: str = "Researcher"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    institution: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
