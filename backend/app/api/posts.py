"""API layer for Posts - HTTP handling."""
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
from ..services import list_posts_service, get_post_service, create_post_service, update_post_service, delete_post_service, get_like_status_service, toggle_like_service
from ..utils.security import get_current_user
from ..models import User

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("", response_model=PostListResponse)
def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return list_posts_service(db, page=page, size=size, category=category, tag=tag, q=q, current_user=current_user)


@router.get("/{id_or_slug}", response_model=PostResponse)
def get_post(
    id_or_slug: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return get_post_service(db, id_or_slug, request, current_user)


@router.post("", response_model=PostResponse, status_code=201)
def create_new_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return create_post_service(db, post, current_user)


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post: PostUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return update_post_service(db, post_id, post, current_user)


@router.delete("/{post_id}", status_code=204)
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    delete_post_service(db, post_id, current_user)
    return None


@router.get("/{slug}/like", response_model=LikeStatusResponse)
def get_like_status(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    return get_like_status_service(db, slug, request)


@router.post("/{slug}/like", response_model=LikeStatusResponse)
def toggle_like(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    return toggle_like_service(db, slug, request)
