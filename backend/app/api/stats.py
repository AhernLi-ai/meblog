"""API layer for Stats - HTTP handling."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.services import StatsService
from app.utils.security import get_current_user
from app.models import Admin

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.post("/log/{post_id}")
async def log_access(
    post_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    return await StatsService.log_access_service(db, post_id, request)


@router.get("/post/{post_id}/unique-visitors")
async def get_unique_visitors(
    post_id: str,
    days: int = 7,
    db: AsyncSession = Depends(get_db)
):
    return await StatsService.get_unique_visitors_service(db, post_id, days)


@router.get("/trends")
async def get_trends(
    days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    return await StatsService.get_trends_service(db, days)


@router.get("/popular-posts")
async def get_popular_posts(
    days: int = 30,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    return await StatsService.get_popular_posts_service(db, days, limit)


@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[Admin] = Depends(get_current_user)
):
    return await StatsService.get_summary_service(db, current_user)
