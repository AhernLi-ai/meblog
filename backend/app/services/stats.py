"""Service layer for Stats - business logic."""
import hashlib
from fastapi import Request
from sqlalchemy.orm import Session
from typing import Optional
from ..models import User
from ..dao import (
    log_access,
    get_unique_visitors_count,
    get_trends_data,
    get_popular_posts_data,
    get_summary_data,
)


def get_visitor_id(request: Request) -> str:
    """Generate a unique visitor ID based on IP."""
    ip = request.client.host if request.client else "unknown"
    # Simple hash to anonymize
    return hashlib.md5(ip.encode()).hexdigest()[:16]


def log_access_service(
    db: Session,
    post_id: int,
    request: Request,
) -> dict:
    """Log a page access for statistics."""
    visitor_id = get_visitor_id(request)
    user_agent = request.headers.get("user-agent", "")[:500] if request.headers.get("user-agent") else None
    referrer = request.headers.get("referer", "")[:500] if request.headers.get("referer") else None

    log_access(db, post_id, visitor_id, user_agent, referrer)
    return {"success": True}


def get_unique_visitors_service(
    db: Session,
    post_id: int,
    days: int = 7,
) -> dict:
    """Get unique visitor count for a post."""
    result = get_unique_visitors_count(db, post_id, days)
    return {"post_id": post_id, "unique_visitors": result, "days": days}


def get_trends_service(
    db: Session,
    days: int = 30,
) -> dict:
    """Get access trends for the last N days."""
    return get_trends_data(db, days)


def get_popular_posts_service(
    db: Session,
    days: int = 30,
    limit: int = 10,
) -> dict:
    """Get most popular posts by unique visitors."""
    return get_popular_posts_data(db, days, limit)


def get_summary_service(
    db: Session,
    current_user: Optional[User] = None,
) -> dict:
    """Get overall statistics summary. Requires authentication."""
    if current_user is None:
        return {"error": "Authentication required"}
    return get_summary_data(db)
