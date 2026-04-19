"""Service layer for Stats - business logic."""
import hashlib
from fastapi import Request
from sqlalchemy.orm import Session
from typing import Optional
from ..models import User
from ..dao import StatsDao


class StatsService:
    @staticmethod
    def get_visitor_id(request: Request) -> str:
        """Generate a unique visitor ID based on IP."""
        ip = request.client.host if request.client else "unknown"
        # Simple hash to anonymize
        return hashlib.md5(ip.encode()).hexdigest()[:16]

    @staticmethod
    def log_access_service(
        db: Session,
        post_id: int,
        request: Request,
    ) -> dict:
        """Log a page access for statistics."""
        visitor_id = StatsService.get_visitor_id(request)
        user_agent = request.headers.get("user-agent", "")[:500] if request.headers.get("user-agent") else None
        referrer = request.headers.get("referer", "")[:500] if request.headers.get("referer") else None

        StatsDao.log_access(db, post_id, visitor_id, user_agent, referrer)
        return {"success": True}

    @staticmethod
    def get_unique_visitors_service(
        db: Session,
        post_id: int,
        days: int = 7,
    ) -> dict:
        """Get unique visitor count for a post."""
        result = StatsDao.get_unique_visitors_count(db, post_id, days)
        return {"post_id": post_id, "unique_visitors": result, "days": days}

    @staticmethod
    def get_trends_service(
        db: Session,
        days: int = 30,
    ) -> dict:
        """Get access trends for the last N days."""
        return StatsDao.get_trends_data(db, days)

    @staticmethod
    def get_popular_posts_service(
        db: Session,
        days: int = 30,
        limit: int = 10,
    ) -> dict:
        """Get most popular posts by unique visitors."""
        return StatsDao.get_popular_posts_data(db, days, limit)

    @staticmethod
    def get_summary_service(
        db: Session,
        current_user: Optional[User] = None,
    ) -> dict:
        """Get overall statistics summary. Requires authentication."""
        if current_user is None:
            return {"error": "Authentication required"}
        return StatsDao.get_summary_data(db)