"""Service layer for Tag - business logic."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.models import Admin
from app.schemas import TagCreate, TagUpdate, TagResponse
from app.dao import TagDao


class TagService:
    @staticmethod
    async def list_tags_service(db: AsyncSession) -> List[TagResponse]:
        return await TagDao.get_tags(db)

    @staticmethod
    async def create_tag_service(
        db: AsyncSession,
        tag: TagCreate,
        current_admin: Admin,
    ) -> TagResponse:
        try:
            tag.created_by = current_admin.id
            return await TagDao.create_tag(db, tag)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def update_tag_service(
        db: AsyncSession,
        tag_id: str,
        tag: TagUpdate,
        current_admin: Admin,
    ) -> TagResponse:
        try:
            tag.updated_by = current_admin.id
            updated = await TagDao.update_tag(db, tag_id, tag)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        if not updated:
            raise HTTPException(status_code=404, detail="Tag not found")
        return updated

    @staticmethod
    async def delete_tag_service(db: AsyncSession, tag_id: str) -> None:
        success = await TagDao.delete_tag(db, tag_id)
        if not success:
            raise HTTPException(status_code=404, detail="Tag not found")