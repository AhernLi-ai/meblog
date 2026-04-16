"""Service layer for Post - business logic."""
import hashlib
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Tuple, List
from ..models import Post, User, AccessLog, PostLike
from ..schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
from ..dao import get_posts, get_post_by_id, get_post_by_slug, create_post, update_post, delete_post
from ..utils.logger import log_post_action


def get_visitor_id(request) -> str:
    """Generate a visitor ID from IP + User-Agent[:100]"""
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")[:100]
    return hashlib.md5(f"{ip}{ua}".encode()).hexdigest()


def list_posts_service(
    db: Session,
    page: int = 1,
    size: int = 10,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    current_user: Optional[User] = None
) -> PostListResponse:
    """List posts with pagination and filtering."""
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


def get_post_service(
    db: Session,
    id_or_slug: str,
    request,
    current_user: Optional[User] = None
) -> PostResponse:
    """Get a single post by ID or slug, with access logging."""
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


def create_post_service(
    db: Session,
    post: PostCreate,
    current_user: User
) -> PostResponse:
    """Create a new post. Requires authentication."""
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = create_post(db, post, current_user.id)
    log_post_action("CREATE", result.id, current_user.id, f"title={result.title}")
    return result


def update_post_service(
    db: Session,
    post_id: int,
    post: PostUpdate,
    current_user: User
) -> PostResponse:
    """Update an existing post. Requires authentication and ownership."""
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


def delete_post_service(
    db: Session,
    post_id: int,
    current_user: User
) -> None:
    """Delete a post. Requires authentication and ownership."""
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    existing = get_post_by_id(db, post_id, include_unpublished=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    log_post_action("DELETE", post_id, current_user.id, f"title={existing.title}")
    delete_post(db, post_id)


def get_like_status_service(
    db: Session,
    slug: str,
    request,
) -> LikeStatusResponse:
    """Get like status and count for a post."""
    post = get_post_by_slug(db, slug, include_unpublished=False)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    visitor_id = get_visitor_id(request)
    liked = db.query(PostLike).filter(
        and_(PostLike.post_id == post.id, PostLike.visitor_id == visitor_id)
    ).first() is not None

    return LikeStatusResponse(liked=liked, like_count=post.like_count)


def toggle_like_service(
    db: Session,
    slug: str,
    request,
) -> LikeStatusResponse:
    """Toggle like status for a post. Liking increments like_count, unliking decrements."""
    post = get_post_by_slug(db, slug, include_unpublished=False)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    visitor_id = get_visitor_id(request)
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
