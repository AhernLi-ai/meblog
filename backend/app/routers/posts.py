from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
import hashlib
from ..database import get_db
from ..schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
from ..crud import get_posts, get_post_by_id, get_post_by_slug, create_post, update_post, delete_post
from ..utils.security import get_current_user
from ..utils.logger import log_post_action
from ..models import User, AccessLog, PostLike

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


def _get_visitor_id(request: Request) -> str:
    """Generate a visitor ID from IP + User-Agent[:100]"""
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")[:100]
    return hashlib.md5(f"{ip}{ua}".encode()).hexdigest()


@router.get("/{slug}/like", response_model=LikeStatusResponse)
def get_like_status(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Get like status and count for a post."""
    post = get_post_by_slug(db, slug, include_unpublished=False)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    visitor_id = _get_visitor_id(request)
    liked = db.query(PostLike).filter(
        and_(PostLike.post_id == post.id, PostLike.visitor_id == visitor_id)
    ).first() is not None

    return LikeStatusResponse(liked=liked, like_count=post.like_count)


@router.post("/{slug}/like", response_model=LikeStatusResponse)
def toggle_like(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Toggle like status for a post. Liking increments like_count, unliking decrements."""
    post = get_post_by_slug(db, slug, include_unpublished=False)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    visitor_id = _get_visitor_id(request)
    existing = db.query(PostLike).filter(
        and_(PostLike.post_id == post.id, PostLike.visitor_id == visitor_id)
    ).first()

    if existing:
        # Unlike: remove like record and decrement count
        db.delete(existing)
        post.like_count = max(0, post.like_count - 1)
        liked = False
    else:
        # Like: add like record and increment count
        new_like = PostLike(post_id=post.id, visitor_id=visitor_id)
        db.add(new_like)
        post.like_count = post.like_count + 1
        liked = True

    db.commit()
    db.refresh(post)
    return LikeStatusResponse(liked=liked, like_count=post.like_count)
