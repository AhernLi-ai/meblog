"""Service layer for Tag - business logic."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import TagCreate, TagUpdate, TagResponse
from ..dao import TagDao


class TagService:
    @staticmethod
    def list_tags_service(db: Session) -> List[TagResponse]:
        """Get all tags."""
        return TagDao.get_tags(db)

    @staticmethod
    def create_tag_service(
        db: Session,
        tag: TagCreate,
    ) -> TagResponse:
        """Create a new tag. Requires authentication."""
        try:
            return TagDao.create_tag(db, tag)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def update_tag_service(
        db: Session,
        tag_id: int,
        tag: TagUpdate,
    ) -> TagResponse:
        """Update an existing tag. Requires authentication."""
        try:
            updated = TagDao.update_tag(db, tag_id, tag)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        if not updated:
            raise HTTPException(status_code=404, detail="Tag not found")
        return updated

    @staticmethod
    def delete_tag_service(db: Session, tag_id: int) -> None:
        """Delete a tag. Requires authentication."""
        success = TagDao.delete_tag(db, tag_id)
        if not success:
            raise HTTPException(status_code=404, detail="Tag not found")