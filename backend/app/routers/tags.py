from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..schemas import TagCreate, TagUpdate, TagResponse
from ..crud import (
    get_tags, get_tag_by_id, create_tag,
    update_tag, delete_tag
)
from ..utils.security import get_current_user
from ..models import User

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=List[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    return get_tags(db)


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_new_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return create_tag(db, tag)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{tag_id}", response_model=TagResponse)
def update_existing_tag(
    tag_id: int,
    tag: TagUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        updated = update_tag(db, tag_id, tag)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Tag not found")
    return updated


@router.delete("/{tag_id}", status_code=204)
def delete_existing_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    success = delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return None
