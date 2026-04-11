import re
from sqlalchemy.orm import Session
from slugify import slugify as python_slugify
from ..models import Post


def generate_slug(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    slug = python_slugify(text, lowercase=True, max_length=200)
    return slug


def generate_unique_slug(db: Session, title: str, exclude_id: int = None) -> str:
    """
    Generate a unique slug for a post.
    If the slug already exists, appends a counter suffix.
    """
    from sqlalchemy import or_
    
    slug = generate_slug(title)
    original_slug = slug
    counter = 1
    
    while True:
        query = db.query(Post.slug).filter(Post.slug == slug)
        if exclude_id is not None:
            query = query.filter(Post.id != exclude_id)
        
        existing = query.first()
        if not existing:
            break
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    return slug
