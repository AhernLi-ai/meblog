from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    visitor_id = Column(String(64), nullable=False, index=True)  # MD5(ip + UA[:100])
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Unique constraint: one like per visitor per post
    __table_args__ = (
        UniqueConstraint("post_id", "visitor_id", name="uq_post_visitor"),
    )

    # Relationship
    post = relationship("Post", back_populates="likes")
