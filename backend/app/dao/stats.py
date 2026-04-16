"""DAO layer for Stats - database CRUD operations."""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from ..models import AccessLog, Post


def log_access(db: Session, post_id: int, visitor_id: str, user_agent: str = None, referrer: str = None):
    """Log a page access for statistics."""
    log = AccessLog(
        post_id=post_id,
        visitor_id=visitor_id,
        user_agent=user_agent,
        referrer=referrer,
    )
    db.add(log)
    db.commit()


def get_unique_visitors_count(db: Session, post_id: int, days: int = 7) -> int:
    """Get unique visitor count for a post."""
    since = datetime.now() - timedelta(days=days)
    result = db.query(
        func.count(func.distinct(AccessLog.visitor_id))
    ).filter(
        AccessLog.post_id == post_id,
        AccessLog.accessed_at >= since
    ).scalar()
    return result or 0


def get_trends_data(db: Session, days: int = 30):
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


def get_popular_posts_data(db: Session, days: int = 30, limit: int = 10):
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


def get_summary_data(db: Session):
    """Get overall statistics summary."""
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
