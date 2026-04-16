"""API layer for Stats - HTTP handling."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..services import (
    log_access_service,
    get_unique_visitors_service,
    get_trends_service,
    get_popular_posts_service,
    get_summary_service,
)
from ..utils.security import get_current_user
from ..models import User

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.post("/log/{post_id}")
def log_access(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Log a page access for statistics."""
    return log_access_service(db, post_id, request)


@router.get("/post/{post_id}/unique-visitors")
def get_unique_visitors(
    post_id: int,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get unique visitor count for a post."""
    return get_unique_visitors_service(db, post_id, days)


@router.get("/trends")
def get_trends(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get access trends for the last N days."""
    return get_trends_service(db, days)


@router.get("/popular-posts")
def get_popular_posts(
    days: int = 30,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get most popular posts by unique visitors."""
    return get_popular_posts_service(db, days, limit)


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get overall statistics summary. Requires authentication."""
    return get_summary_service(db, current_user)
