"""API layer for Posts - HTTP handling."""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
from app.services import PostService
from app.utils.security import get_current_user
from app.models import User


router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("", response_model=PostListResponse)
def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    project: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return PostService.list_posts(db, page=page, size=size, project=project, tag=tag, q=q, current_user=current_user)


@router.get("/{id_or_slug}", response_model=PostResponse)
def get_post(
    id_or_slug: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return PostService.get_post(db, id_or_slug, request, current_user)


@router.post("", response_model=PostResponse, status_code=201)
def create_new_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return PostService.create_post(db, post, current_user)


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post: PostUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return PostService.update_post(db, post_id, post, current_user)


@router.delete("/{post_id}", status_code=204)
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    PostService.delete_post(db, post_id, current_user)
    return None


@router.get("/{slug}/like", response_model=LikeStatusResponse)
def get_like_status(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    return PostService.get_like_status(db, slug, request)


@router.post("/{slug}/like", response_model=LikeStatusResponse)
def toggle_like(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    return PostService.toggle_like(db, slug, request)