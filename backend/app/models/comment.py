from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True, index=True)
    nickname = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)  # 仅管理员可见
    website = Column(String(200), nullable=True)  # 个人网站（选填）
    content = Column(Text, nullable=False)
    visitor_id = Column(String(64), nullable=False, index=True)  # MD5 of IP+UA
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")
