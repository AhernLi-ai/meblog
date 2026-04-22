"""
Service layer for Post - business logic.
"""
from fastapi import HTTPException
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.models import Post, Admin, PostViewEvent, PostLike
from app.schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
from app.schemas.post import AuthorInfo
from app.dao import PostDao
from app.dao.about import AboutDao
from app.utils.logger import logger
from app.services.visitor import VisitorService


class PostService:
    """Service class for Post business logic."""

    @staticmethod
    async def _build_author_info(db: AsyncSession) -> AuthorInfo | None:
        author_profile = await AboutDao.get_author_settings(db)
        if not author_profile:
            author_profile = await AboutDao.create_author_settings(db)
        if not author_profile:
            return None
        return AuthorInfo(id=author_profile.id, username=author_profile.username)

    @staticmethod
    async def _to_post_response(db: AsyncSession, post: Post) -> PostResponse:
        author_info = await PostService._build_author_info(db)
        return PostResponse(
            id=post.id,
            title=post.title,
            slug=post.slug,
            content=post.content,
            summary=post.summary,
            view_count=post.view_count,
            like_count=post.like_count,
            status=post.status,
            created_by=post.created_by,
            updated_by=post.updated_by,
            created_at=post.created_at,
            updated_at=post.updated_at,
            project=post.project,
            tags=post.tags,
            author=author_info,
        )
    
    @staticmethod
    async def list_posts(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        project: Optional[str] = None,
        tag: Optional[str] = None,
        q: Optional[str] = None,
        current_user: Optional[Admin] = None
    ) -> PostListResponse:
        try:
            include_unpublished = current_user is not None
            posts, total = await PostDao.get_posts(
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
    async def get_post(
        db: AsyncSession,
        id_or_slug: str,
        request,
        current_user: Optional[Admin] = None
    ) -> PostResponse:
        try:
            include_unpublished = current_user is not None
            post = await PostDao.get_post_by_id(db, id_or_slug, include_unpublished)
            if not post:
                post = await PostDao.get_post_by_slug(db, id_or_slug, include_unpublished)

            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            if not include_unpublished:
                visitor_id = await VisitorService.resolve_visitor_id(db, request)
                log = PostViewEvent(
                    post_id=post.id,
                    visitor_id=visitor_id,
                    user_agent=request.headers.get("user-agent", "")[:500],
                    referrer=request.headers.get("referer", "")[:500],
                )
                db.add(log)
                await db.commit()

            return await PostService._to_post_response(db, post)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting post {id_or_slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def create_post(
        db: AsyncSession,
        post: PostCreate,
        current_user: Admin
    ) -> PostResponse:
        """Create a new post. Requires authentication."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            result = await PostDao.create_post(db, post, creator_id=current_user.id)
            logger.info(f"Admin {current_user.id} created post {result.id}")
            return await PostService._to_post_response(db, result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating post: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def update_post(
        db: AsyncSession,
        post_id: str,
        post: PostUpdate,
        current_user: Admin
    ) -> PostResponse:
        """Update an existing post. Requires authentication and ownership."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            existing = await PostDao.get_post_by_id(db, post_id, include_unpublished=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Post not found")
            creator_id = existing.created_by or existing.user_id
            if creator_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to update this post")
            result = await PostDao.update_post(
                db,
                post_id,
                post,
                updater_id=current_user.id,
                include_unpublished=True,
            )
            logger.info(f"Admin {current_user.id} updated post {post_id}")
            return await PostService._to_post_response(db, result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating post {post_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def delete_post(
        db: AsyncSession,
        post_id: str,
        current_user: Admin
    ) -> None:
        """Delete a post. Requires authentication and ownership."""
        try:
            if current_user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
            existing = await PostDao.get_post_by_id(db, post_id, include_unpublished=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Post not found")
            creator_id = existing.created_by or existing.user_id
            if creator_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this post")
            await PostDao.delete_post(db, post_id)
            logger.info(f"Admin {current_user.id} deleted post {post_id}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting post {post_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def get_like_status(
        db: AsyncSession,
        slug: str,
        request,
    ) -> LikeStatusResponse:
        """Get like status and count for a post."""
        try:
            post = await PostDao.get_post_by_slug(db, slug, include_unpublished=False)
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            visitor_id = await VisitorService.resolve_visitor_id(db, request)
            liked = (
                await db.execute(
                    select(PostLike).where(and_(PostLike.post_id == post.id, PostLike.visitor_id == visitor_id))
                )
            ).scalar_one_or_none() is not None

            return LikeStatusResponse(liked=liked, like_count=post.like_count)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting like status for post {slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def toggle_like(
        db: AsyncSession,
        slug: str,
        request,
    ) -> LikeStatusResponse:
        """Toggle like status for a post. Liking increments like_count, unliking decrements."""
        try:
            post = await PostDao.get_post_by_slug(db, slug, include_unpublished=False)
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            visitor_id = await VisitorService.resolve_visitor_id(db, request)
            existing = (
                await db.execute(
                    select(PostLike).where(and_(PostLike.post_id == post.id, PostLike.visitor_id == visitor_id))
                )
            ).scalar_one_or_none()

            if existing:
                await db.delete(existing)
                post.like_count = max(0, post.like_count - 1)
                liked = False
            else:
                new_like = PostLike(post_id=post.id, visitor_id=visitor_id)
                db.add(new_like)
                post.like_count = post.like_count + 1
                liked = True

            await db.commit()
            await db.refresh(post)
            logger.info(f"Visitor {visitor_id} {'unliked' if not liked else 'liked'} post {post.id}")
            return LikeStatusResponse(liked=liked, like_count=post.like_count)
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"Error toggling like for post {slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")