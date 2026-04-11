from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # About page fields
    avatar_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    tech_stack = Column(Text, nullable=True)  # JSON string of tags list
    github_url = Column(String(500), nullable=True)
    zhihu_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    wechat_id = Column(String(100), nullable=True)

    # Relationships
    posts = relationship("Post", back_populates="author")
    settings = relationship("UserSettings", back_populates="user", uselist=False)
