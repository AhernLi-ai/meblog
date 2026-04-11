from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, List
import hashlib
from ..database import get_db
from ..schemas import PostCreate, PostUpdate, PostResponse, PostListResponse
from ..crud import get_posts, get_post_by_id, get_post_by_slug, create_post, update_post, delete_post
from ..utils.security import get_current_user
from ..utils.logger import log_post_action
from ..models import User, AccessLog

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
def get_post(
    id_or_slug: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    include_unpublished = current_user is not None
    try:
        post_id = int(id_or_slug)
        post = get_post_by_id(db, post_id, include_unpublished)
    except ValueError:
        post = get_post_by_slug(db, id_or_slug, include_unpublished)


    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Log access for statistics
    if not include_unpublished:  # Only log for public (published) posts
        ip = request.client.host if request.client else "unknown"
        visitor_id = hashlib.md5(ip.encode()).hexdigest()[:16]
        log = AccessLog(
            post_id=post.id,
            visitor_id=visitor_id,
            user_agent=request.headers.get("user-agent", "")[:500],
            referrer=request.headers.get("referer", "")[:500],
        )
        db.add(log)
        db.commit()
    
    return post


@router.post("", response_model=PostResponse, status_code=201)
def create_new_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = create_post(db, post, current_user.id)
    log_post_action("CREATE", result.id, current_user.id, f"title={result.title}")
    return result


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post: PostUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    existing = get_post_by_id(db, post_id, include_unpublished=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    result = update_post(db, post_id, post, include_unpublished=True)
    log_post_action("UPDATE", post_id, current_user.id, f"title={result.title}")
    return result


@router.delete("/{post_id}", status_code=204)
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    existing = get_post_by_id(db, post_id, include_unpublished=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    log_post_action("DELETE", post_id, current_user.id, f"title={existing.title}")
    delete_post(db, post_id)
    return None
