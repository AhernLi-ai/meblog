"""
Service layer for Post - business logic.
"""
import hashlib
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from app.models import Post, User, AccessLog, PostLike
from app.schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
from app.dao import PostDao
from app.utils.logger import logger


class PostService:
    """Service class for Post business logic."""
    
    @staticmethod
    def get_visitor_id(request) -> str:
        """Generate a visitor ID from IP + User-Agent[:100]"""
        ip = request.client.host if request.client else "unknown"
        ua = request.headers.get("user-agent", "")[:100]
        return hashlib.md5(f"{ip}{ua}".encode()).hexdigest()

    @staticmethod
    def list_posts(
        db: Session,
        page: int = 1,
        size: int = 10,
        project: Optional[str] = None,
        tag: Optional[str] = None,
        q: Optional[str] = None,
        current_user: Optional[User] = None
    ) -> PostListResponse:
        """List posts with pagination and filtering."""
        try:
            include_unpublished = current_user is not None
            posts, total = PostDao.get_posts(
                db, page=page, size=size,
                project_slug=project, tag_slug=tag, q=q,
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
        except Exception as e:
            logger.error(f"Error listing posts: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def get_post(
        db: Session,
        id_or_slug: str,
        request,
        current_user: Optional[User] = None
    ) -> PostResponse:
        """Get a single post by ID or slug, with access logging."""
        try:
            include_unpublished = current_user is not None
            try:
                post_id = int(id_or_slug)
                post = PostDao.get_post_by_id(db, post_id, include_unpublished)
            except ValueError:
                post = PostDao.get_post_by_slug(db, id_or_slug, include_unpublished)

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
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting post {id_or_slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def create_post(
        db: Session,
        post: PostCreate,
        current_user: User
    ) -> PostResponse:
        """Create a new post. Requires authentication."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            result = PostDao.create_post(db, post, current_user.id)
            logger.info(f"User {current_user.id} created post {result.id}")
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating post: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def update_post(
        db: Session,
        post_id: int,
        post: PostUpdate,
        current_user: User
    ) -> PostResponse:
        """Update an existing post. Requires authentication and ownership."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            existing = PostDao.get_post_by_id(db, post_id, include_unpublished=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Post not found")
            if existing.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to update this post")
            result = PostDao.update_post(db, post_id, post, include_unpublished=True)
            logger.info(f"User {current_user.id} updated post {post_id}")
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating post {post_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def delete_post(
        db: Session,
        post_id: int,
        current_user: User
    ) -> None:
        """Delete a post. Requires authentication and ownership."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            existing = PostDao.get_post_by_id(db, post_id, include_unpublished=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Post not found")
            if existing.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this post")
            PostDao.delete_post(db, post_id)
            logger.info(f"User {current_user.id} deleted post {post_id}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting post {post_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def get_like_status(
        db: Session,
        slug: str,
        request,
    ) -> LikeStatusResponse:
        """Get like status and count for a post."""
        try:
            post = PostDao.get_post_by_slug(db, slug, include_unpublished=False)
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            visitor_id = PostService.get_visitor_id(request)
            liked = db.query(PostLike).filter(
                and_(PostLike.post_id == post.id, PostLike.visitor_id == visitor_id)
            ).first() is not None

            return LikeStatusResponse(liked=liked, like_count=post.like_count)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting like status for post {slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def toggle_like(
        db: Session,
        slug: str,
        request,
    ) -> LikeStatusResponse:
        """Toggle like status for a post. Liking increments like_count, unliking decrements."""
        try:
            post = PostDao.get_post_by_slug(db, slug, include_unpublished=False)
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            visitor_id = PostService.get_visitor_id(request)
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
            logger.info(f"Visitor {visitor_id} {'unliked' if not liked else 'liked'} post {post.id}")
            return LikeStatusResponse(liked=liked, like_count=post.like_count)
        except Exception as e:
            db.rollback()
            logger.error(f"Error toggling like for post {slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")