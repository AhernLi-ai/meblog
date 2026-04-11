import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Tag, Post, post_tags
from ..schemas import TagCreate, TagUpdate


def generate_slug(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


def get_tags(db: Session):
    """Get all tags with their post counts in a single query."""
    tags = db.query(Tag).all()
    
    if not tags:
        return tags
    
    tag_ids = [t.id for t in tags]
    counts = db.query(
        post_tags.c.tag_id,
        func.count(post_tags.c.post_id).label('count')
    ).join(
        Post, Post.id == post_tags.c.post_id
    ).filter(
        Post.is_deleted == False,
        Post.status == 'published',
        post_tags.c.tag_id.in_(tag_ids)
    ).group_by(post_tags.c.tag_id).all()
    
    count_map = {tag_id: count for tag_id, count in counts}
    for tag in tags:
        tag.post_count = count_map.get(tag.id, 0)
    
    return tags


def get_tag_by_id(db: Session, tag_id: int):
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_slug(db: Session, slug: str):
    return db.query(Tag).filter(Tag.slug == slug).first()


def create_tag(db: Session, tag: TagCreate):
    existing = db.query(Tag).filter(Tag.name == tag.name).first()
    if existing:
        raise ValueError("Tag with this name already exists")
    slug = generate_slug(tag.name)
    db_tag = Tag(name=tag.name, slug=slug)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def update_tag(db: Session, tag_id: int, tag: TagUpdate):
    db_tag = get_tag_by_id(db, tag_id)
    if not db_tag:
        return None
    if tag.name is not None:
        # Check for duplicate name (excluding current tag)
        existing = db.query(Tag).filter(
            Tag.name == tag.name,
            Tag.id != tag_id
        ).first()
        if existing:
            raise ValueError("Tag with this name already exists")
        db_tag.name = tag.name
        db_tag.slug = generate_slug(tag.name)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int):
    db_tag = get_tag_by_id(db, tag_id)
    if not db_tag:
        return False
    db.delete(db_tag)
    db.commit()
    return True
