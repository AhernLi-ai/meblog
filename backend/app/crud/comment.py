from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Tuple
from ..models import Comment, Post
from ..schemas.comment import CommentCreate


def get_comments_by_post_slug(db: Session, post_slug: str) -> Tuple[List[Comment], int]:
    """Get all top-level comments for a post by slug, with nested replies."""
    post = db.query(Post).filter(Post.slug == post_slug, Post.is_deleted == False).first()
    if not post:
        return [], 0

    # Get top-level comments (parent_id is null)
    top_comments = (
        db.query(Comment)
        .filter(Comment.post_id == post.id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at.desc())
        .all()
    )

    # Get all replies for these comments
    top_ids = [c.id for c in top_comments]
    if top_ids:
        replies = (
            db.query(Comment)
            .filter(Comment.parent_id.in_(top_ids))
            .order_by(Comment.created_at.asc())
            .all()
        )
        # Group replies by parent_id
        replies_by_parent = {}
        for r in replies:
            replies_by_parent.setdefault(r.parent_id, []).append(r)
        # Attach replies to their parent
        for c in top_comments:
            c.replies = replies_by_parent.get(c.id, [])

    total = len(top_comments) + sum(len(c.replies) for c in top_comments)
    return top_comments, total


def create_comment(db: Session, comment_data: CommentCreate, visitor_id: str) -> Comment:
    """Create a new comment."""
    comment = Comment(
        post_id=comment_data.post_id,
        parent_id=comment_data.parent_id,
        nickname=comment_data.nickname,
        email=comment_data.email,
        content=comment_data.content,
        visitor_id=visitor_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment_id: int) -> bool:
    """Delete a comment by ID. Returns True if deleted."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        return False
    db.delete(comment)
    db.commit()
    return True
