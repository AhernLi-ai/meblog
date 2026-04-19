"""Service layer for Auth - business logic."""
from fastapi import HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from ..schemas import UserCreate, UserResponse, Token
from ..dao import get_user_by_username, get_user_by_email, create_user
from ..utils.security import verify_password, create_access_token
from ..utils.logger import log_user_login
from configs import settings


def register_service(db: Session, user: UserCreate) -> UserResponse:
    """Register a new user."""
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    result = create_user(db, user)
    log_user_login(user.username, True)
    return result


def login_service(
    db: Session,
    form_data: OAuth2PasswordRequestForm,
    request: Request = None
) -> Token:
    """Login and return access token."""
    user = get_user_by_username(db, form_data.username)
    if not user:
        user = get_user_by_email(db, form_data.username)
    
    ip = request.client.host if request else "unknown"
    if not user or not verify_password(form_data.password, user.password_hash):
        log_user_login(form_data.username, False, ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    log_user_login(user.username, True, ip)
    return {"access_token": access_token, "token_type": "bearer"}


def get_me_service(current_user: Optional[UserResponse]) -> UserResponse:
    """Get current user info."""
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user
