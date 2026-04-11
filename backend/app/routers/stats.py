from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Optional
from ..database import get_db
from ..models import AccessLog, Post
from ..utils.security import get_current_user
from ..models import User
import hashlib

router = APIRouter(prefix="/stats", tags=["Statistics"])


def get_visitor_id(request: Request) -> str:
    """Generate a unique visitor ID based on IP."""
    ip = request.client.host if request.client else "unknown"
    # Simple hash to anonymize
    return hashlib.md5(ip.encode()).hexdigest()[:16]


@router.post("/log/{post_id}")
def log_access(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Log a page access for statistics."""
    visitor_id = get_visitor_id(request)
    user_agent = request.headers.get("user-agent", "")[:500] if request.headers.get("user-agent") else None
    referrer = request.headers.get("referer", "")[:500] if request.headers.get("referer") else None

    log = AccessLog(
        post_id=post_id,
        visitor_id=visitor_id,
        user_agent=user_agent,
        referrer=referrer,
    )
    db.add(log)
    db.commit()
    return {"success": True}


@router.get("/post/{post_id}/unique-visitors")
def get_unique_visitors(
    post_id: int,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get unique visitor count for a post."""
    since = datetime.now() - timedelta(days=days)
    
    # Count unique visitors in the time period
    result = db.query(
        func.count(func.distinct(AccessLog.visitor_id))
    ).filter(
        AccessLog.post_id == post_id,
        AccessLog.accessed_at >= since
    ).scalar()
    
    return {"post_id": post_id, "unique_visitors": result or 0, "days": days}


@router.get("/trends")
def get_trends(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get access trends for the last N days."""
    since = datetime.now() - timedelta(days=days)
    
    # Get daily unique visitors
    daily = db.query(
        func.date(AccessLog.accessed_at).label('date'),
        func.count(func.distinct(AccessLog.visitor_id)).label('visitors'),
        func.count(AccessLog.id).label('views')
    ).filter(
        AccessLog.accessed_at >= since
    ).group_by(
        func.date(AccessLog.accessed_at)
    ).order_by(
        func.date(AccessLog.accessed_at)
    ).all()
    
    return {
        "days": days,
        "total_visitors": sum(d.visitors for d in daily),
        "total_views": sum(d.views for d in daily),
        "daily": [{"date": str(d.date), "visitors": d.visitors, "views": d.views} for d in daily]
    }


@router.get("/popular-posts")
def get_popular_posts(
    days: int = 30,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get most popular posts by unique visitors."""
    since = datetime.now() - timedelta(days=days)
    
    results = db.query(
        AccessLog.post_id,
        func.count(func.distinct(AccessLog.visitor_id)).label('visitors'),
        func.count(AccessLog.id).label('views')
    ).filter(
        AccessLog.accessed_at >= since
    ).group_by(
        AccessLog.post_id
    ).order_by(
        func.count(func.distinct(AccessLog.visitor_id)).desc()
    ).limit(limit).all()
    
    # Get post details
    posts_data = []
    for r in results:
        post = db.query(Post).filter(Post.id == r.post_id).first()
        if post:
            posts_data.append({
                "id": post.id,
                "title": post.title,
                "slug": post.slug,
                "visitors": r.visitors,
                "views": r.views
            })
    
    return {"days": days, "posts": posts_data}


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get overall statistics summary. Requires authentication."""
    if current_user is None:
        return {"error": "Authentication required"}
    
    # Total stats
    total_posts = db.query(Post).filter(Post.is_deleted == False, Post.status == "published").count()
    total_views = db.query(func.sum(Post.view_count)).scalar() or 0
    
    # This month stats
    month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_visitors = db.query(
        func.count(func.distinct(AccessLog.visitor_id))
    ).filter(AccessLog.accessed_at >= month_start).scalar() or 0
    
    month_views = db.query(AccessLog).filter(
        AccessLog.accessed_at >= month_start
    ).count()
    
    return {
        "total_posts": total_posts,
        "total_views": total_views,
        "month_visitors": month_visitors,
        "month_views": month_views
    }
