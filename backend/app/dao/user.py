"""
DAO layer for User - database CRUD operations.
"""
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate
from app.utils.security import get_password_hash
from app.utils.logger import logger


class UserDao:
    """Data Access Object for User operations."""
    
    @staticmethod
    def get_user_by_username(db: Session, username: str):
        """Get user by username."""
        try:
            return db.query(User).filter(User.username == username).first()
        except Exception as e:
            logger.error(f"Error getting user by username {username}: {e}")
            raise

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        """Get user by email."""
        try:
            return db.query(User).filter(User.email == email).first()
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            raise

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        """Get user by ID."""
        try:
            return db.query(User).filter(User.id == user_id).first()
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {e}")
            raise

    @staticmethod
    def create_user(db: Session, user: UserCreate):
        """Create a new user."""
        try:
            hashed_password = get_password_hash(user.password)
            db_user = User(
                username=user.username,
                email=user.email,
                password_hash=hashed_password,
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            logger.info(f"Created user: {db_user.username} (ID: {db_user.id})")
            return db_user
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user {user.username}: {e}")
            raise