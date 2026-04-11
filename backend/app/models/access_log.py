from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from ..database import Base


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, nullable=True)  # Nullable for non-post pages
    visitor_id = Column(String(64), nullable=False, index=True)  # IP or cookie hash
    user_agent = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)
    accessed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    # No foreign key to avoid circular imports
