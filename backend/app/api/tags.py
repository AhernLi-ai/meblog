"""API layer for Tags - HTTP handling."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..schemas import TagCreate, TagUpdate, TagResponse
from ..services import list_tags_service, create_tag_service, update_tag_service, delete_tag_service
from ..utils.security import get_current_user
from ..models import User

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=List[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    return list_tags_service(db)


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_new_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return create_tag_service(db, tag)


@router.put("/{tag_id}", response_model=TagResponse)
def update_existing_tag(
    tag_id: int,
    tag: TagUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return update_tag_service(db, tag_id, tag)


@router.delete("/{tag_id}", status_code=204)
def delete_existing_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    delete_tag_service(db, tag_id)
    return None
