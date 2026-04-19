"""API layer for Auth - HTTP handling."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas import UserCreate, UserResponse, Token
from app.services import AuthService
from app.utils.security import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register(db, user)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    request: Request = None
):
    return AuthService.login(db, form_data, request)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Optional[UserResponse] = Depends(get_current_user)):
    return AuthService.get_me(current_user)
