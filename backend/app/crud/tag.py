from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Tag, Post
from ..schemas import TagCreate, TagUpdate
from ..utils.slug import generate_slug


def get_tags(db: Session):
    # Get tags with post count
    tags = db.query(
        Tag,
        func.count(Post.id).label("post_count")
    ).outerjoin(Post, Post.tags).filter(Post.is_deleted == False, Post.status == "published"
    ).group_by(Tag.id).all()

    result = []
    for tag, count in tags:
        tag.post_count = count
        result.append(tag)
    return result


def get_tag_by_id(db: Session, tag_id: int):
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_slug(db: Session, slug: str):
    return db.query(Tag).filter(Tag.slug == slug).first()


def create_tag(db: Session, tag: TagCreate):
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
