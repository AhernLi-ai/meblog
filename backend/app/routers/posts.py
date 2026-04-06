from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..schemas import PostCreate, PostUpdate, PostResponse, PostListResponse
from ..crud import get_posts, get_post_by_id, get_post_by_slug, create_post, update_post, delete_post
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
    # If user is authenticated, show all posts; otherwise only published
    include_unpublished = current_user is not None
    posts, total = get_posts(
        db, page=page, size=size,
        category_slug=category, tag_slug=tag, q=q,
        include_unpublished=include_unpublished
    )
    pages = (total + size - 1) // size if total > 0 else 1
    return PostListResponse(
        items=posts,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{id_or_slug}", response_model=PostResponse)
def get_post(id_or_slug: str, db: Session = Depends(get_db)):
    # Try to get by ID first, then by slug
    try:
        post_id = int(id_or_slug)
        post = get_post_by_id(db, post_id)
    except ValueError:
        post = get_post_by_slug(db, id_or_slug)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostResponse, status_code=201)
def create_new_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_post(db, post, current_user.id)


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check ownership
    existing = get_post_by_id(db, post_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    return update_post(db, post_id, post)


@router.delete("/{post_id}", status_code=204)
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check ownership
    existing = get_post_by_id(db, post_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    delete_post(db, post_id)
    return None
