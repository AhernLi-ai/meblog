"""Service layer for Comment - business logic."""
import hashlib
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.models import Comment, Post, User
from app.schemas.comment import CommentCreate, CommentResponse, CommentListResponse
from app.dao import CommentDao


class CommentService:
    @staticmethod
    def get_visitor_id(request) -> str:
        """Generate a visitor ID from IP + User-Agent."""
        ip = request.client.host if request.client else "unknown"
        ua = request.headers.get("user-agent", "")[:100]
        return hashlib.md5(f"{ip}{ua}".encode()).hexdigest()

    @staticmethod
    def is_admin(db: Session, user: Optional[User]) -> bool:
        """Check if user is admin."""
        if user is None:
            return False
        return getattr(user, "is_admin", False)

    @staticmethod
    def build_comment_response(comment, include_email: bool = False) -> CommentResponse:
        """Build CommentResponse, optionally including email for admin."""
        replies = []
        if comment.replies:
            replies = [CommentService.build_comment_response(r, include_email) for r in comment.replies]
        return CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            parent_id=comment.parent_id,
            nickname=comment.nickname,
            email=comment.email if include_email else None,
            website=comment.website,
            content=comment.content,
            created_at=comment.created_at,
            replies=replies,
        )

    @staticmethod
    def get_comments_service(
        db: Session,
        post_slug: str,
        request,
    ) -> CommentListResponse:
        """
        Get comments for a post by slug.
        Email field is only visible to admin users.
        """
        from ..utils.security import get_current_user_from_request
        user = get_current_user_from_request(request, db)

        comments, total = CommentDao.get_comments_by_post_slug(db, post_slug)
        include_email = CommentService.is_admin(db, user)
        items = [CommentService.build_comment_response(c, include_email) for c in comments]
        return CommentListResponse(items=items, total=total)

    @staticmethod
    def add_comment_service(
        db: Session,
        comment_data: CommentCreate,
        request,
    ) -> CommentResponse:
        """
        Submit a new comment. No login required.
        Validates post exists and parent comment if provided.
        """
        # Verify post exists
        post = db.query(Post).filter(Post.id == comment_data.post_id, Post.is_deleted == False).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # If parent_id is provided, verify parent exists and belongs to same post
        if comment_data.parent_id is not None:
            parent_comment = db.query(Comment).filter(Comment.id == comment_data.parent_id).first()
            if not parent_comment:
                raise HTTPException(status_code=404, detail="Parent comment not found")
            if parent_comment.post_id != comment_data.post_id:
                raise HTTPException(status_code=400, detail="Parent comment belongs to a different post")

        visitor_id = CommentService.get_visitor_id(request)
        comment = CommentDao.create_comment(db, comment_data, visitor_id)

        # Reload with replies
        comment.replies = []
        return CommentService.build_comment_response(comment, include_email=False)

    @staticmethod
    def remove_comment_service(
        db: Session,
        comment_id: int,
        request,
    ) -> None:
        """
        Delete a comment. Only admin users can delete comments.
        """
        from ..utils.security import get_current_user_from_request
        user = get_current_user_from_request(request, db)
        if not CommentService.is_admin(db, user):
            raise HTTPException(status_code=403, detail="Not authorized")

        success = CommentDao.delete_comment(db, comment_id)
        if not success:
            raise HTTPException(status_code=404, detail="Comment not found")