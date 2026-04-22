"""DAO layer for Stats - database CRUD operations."""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.models import PostViewEvent, Post


class StatsDao:
    @staticmethod
    async def log_access(db: AsyncSession, post_id: str, visitor_id: str, user_agent: str = None, referrer: str = None):
        log = PostViewEvent(
            post_id=post_id,
            visitor_id=visitor_id,
            user_agent=user_agent,
            referrer=referrer,
        )
        db.add(log)
        await db.commit()

    @staticmethod
    async def get_unique_visitors_count(db: AsyncSession, post_id: str, days: int = 7) -> int:
        since = datetime.now() - timedelta(days=days)
        result = (
            await db.execute(
                select(func.count(func.distinct(PostViewEvent.visitor_id))).where(
                    PostViewEvent.post_id == post_id,
                    PostViewEvent.accessed_at >= since,
                )
            )
        ).scalar_one()
        return result or 0

    @staticmethod
    async def get_trends_data(db: AsyncSession, days: int = 30):
        since = datetime.now() - timedelta(days=days)

        daily = (
            await db.execute(
                select(
                    func.date(PostViewEvent.accessed_at).label("date"),
                    func.count(func.distinct(PostViewEvent.visitor_id)).label("visitors"),
                    func.count(PostViewEvent.id).label("views"),
                )
                .where(PostViewEvent.accessed_at >= since)
                .group_by(func.date(PostViewEvent.accessed_at))
                .order_by(func.date(PostViewEvent.accessed_at))
            )
        ).all()

        return {
            "days": days,
            "total_visitors": sum(d.visitors for d in daily),
            "total_views": sum(d.views for d in daily),
            "daily": [{"date": str(d.date), "visitors": d.visitors, "views": d.views} for d in daily]
        }

    @staticmethod
    async def get_popular_posts_data(db: AsyncSession, days: int = 30, limit: int = 10):
        since = datetime.now() - timedelta(days=days)

        results = (
            await db.execute(
                select(
                    PostViewEvent.post_id,
                    func.count(func.distinct(PostViewEvent.visitor_id)).label("visitors"),
                    func.count(PostViewEvent.id).label("views"),
                )
                .where(PostViewEvent.accessed_at >= since)
                .group_by(PostViewEvent.post_id)
                .order_by(func.count(func.distinct(PostViewEvent.visitor_id)).desc())
                .limit(limit)
            )
        ).all()

        posts_data = []
        for r in results:
            if r.post_id is None:
                continue
            post = (await db.execute(select(Post).where(Post.id == r.post_id))).scalar_one_or_none()
            if post:
                posts_data.append({
                    "id": post.id,
                    "title": post.title,
                    "slug": post.slug,
                    "visitors": r.visitors,
                    "views": r.views
                })
        
        return {"days": days, "posts": posts_data}

    @staticmethod
    async def get_summary_data(db: AsyncSession):
        total_posts = (
            await db.execute(
                select(func.count(Post.id)).where(Post.is_deleted.is_(False), Post.status == "published")
            )
        ).scalar_one()
        total_views = (await db.execute(select(func.sum(Post.view_count)))).scalar_one() or 0

        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_visitors = (
            await db.execute(
                select(func.count(func.distinct(PostViewEvent.visitor_id))).where(PostViewEvent.accessed_at >= month_start)
            )
        ).scalar_one() or 0

        month_views = (
            await db.execute(select(func.count(PostViewEvent.id)).where(PostViewEvent.accessed_at >= month_start))
        ).scalar_one()

        return {
            "total_posts": total_posts,
            "total_views": total_views,
            "month_visitors": month_visitors,
            "month_views": month_views
        }