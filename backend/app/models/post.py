from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from .tag import post_tags


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    view_count = Column(Integer, default=0)
    status = Column(String(20), default="draft")  # draft / published
    is_deleted = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
