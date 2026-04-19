"""
Service layer for Auth - business logic.
"""
from fastapi import HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from app.schemas import UserCreate, UserResponse, Token
from app.dao import UserDao
from app.utils.security import verify_password, create_access_token
from app.utils.logger import logger
from configs import settings


class AuthService:
    """Service class for authentication business logic."""
    
    @staticmethod
    def register(db: Session, user: UserCreate) -> UserResponse:
        """Register a new user."""
        try:
            if UserDao.get_user_by_username(db, user.username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            if UserDao.get_user_by_email(db, user.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            result = UserDao.create_user(db, user)
            logger.info(f"User registered: {user.username}")
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error registering user {user.username}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def login(
        db: Session,
        form_data: OAuth2PasswordRequestForm,
        request: Request = None
    ) -> Token:
        """Login and return access token."""
        try:
            user = UserDao.get_user_by_username(db, form_data.username)
            if not user:
                user = UserDao.get_user_by_email(db, form_data.username)
            
            ip = request.client.host if request else "unknown"
            if not user or not verify_password(form_data.password, user.password_hash):
                logger.warning(f"Failed login attempt for {form_data.username} from {ip}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user.id)}, expires_delta=access_token_expires
            )
            logger.info(f"User {user.username} logged in successfully from {ip}")
            return {"access_token": access_token, "token_type": "bearer"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during login for {form_data.username}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def get_me(current_user: Optional[UserResponse]) -> UserResponse:
        """Get current user info."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            return current_user
        except Exception as e:
            logger.error(f"Error getting current user: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")