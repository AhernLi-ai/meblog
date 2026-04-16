"""Service layer for Tag - business logic."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import TagCreate, TagUpdate, TagResponse
from ..dao import get_tags, get_tag_by_id, create_tag, update_tag, delete_tag


def list_tags_service(db: Session) -> List[TagResponse]:
    """Get all tags."""
    return get_tags(db)


def create_tag_service(
    db: Session,
    tag: TagCreate,
) -> TagResponse:
    """Create a new tag. Requires authentication."""
    try:
        return create_tag(db, tag)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def update_tag_service(
    db: Session,
    tag_id: int,
    tag: TagUpdate,
) -> TagResponse:
    """Update an existing tag. Requires authentication."""
    try:
        updated = update_tag(db, tag_id, tag)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Tag not found")
    return updated


def delete_tag_service(db: Session, tag_id: int) -> None:
    """Delete a tag. Requires authentication."""
    success = delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
