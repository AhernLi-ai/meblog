"""
DAO layer for Tag - database CRUD operations.
"""
import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Tag, Post
from app.models.tag import post_tags
from app.schemas import TagCreate, TagUpdate
from app.utils.logger import logger


class TagDao:
    """Data Access Object for Tag operations."""
    
    @staticmethod
    def generate_slug(text: str) -> str:
        """Generate a URL-friendly slug from text."""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[\s_-]+', '-', text)
        text = re.sub(r'^-+|-+$', '', text)
        return text

    @staticmethod
    def get_tags(db: Session):
        """Get all tags with their post counts in a single query."""
        try:
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
        except Exception as e:
            logger.error(f"Error getting tags: {e}")
            raise

    @staticmethod
    def get_tag_by_id(db: Session, tag_id: int):
        """Get tag by ID."""
        try:
            return db.query(Tag).filter(Tag.id == tag_id).first()
        except Exception as e:
            logger.error(f"Error getting tag by ID {tag_id}: {e}")
            raise

    @staticmethod
    def get_tag_by_slug(db: Session, slug: str):
        """Get tag by slug."""
        try:
            return db.query(Tag).filter(Tag.slug == slug).first()
        except Exception as e:
            logger.error(f"Error getting tag by slug {slug}: {e}")
            raise

    @staticmethod
    def create_tag(db: Session, tag: TagCreate):
        """Create a new tag."""
        try:
            existing = db.query(Tag).filter(Tag.name == tag.name).first()
            if existing:
                raise ValueError("Tag with this name already exists")
            slug = TagDao.generate_slug(tag.name)
            db_tag = Tag(name=tag.name, slug=slug)
            db.add(db_tag)
            db.commit()
            db.refresh(db_tag)
            logger.info(f"Created tag: {db_tag.name} (ID: {db_tag.id})")
            return db_tag
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating tag: {e}")
            raise

    @staticmethod
    def update_tag(db: Session, tag_id: int, tag: TagUpdate):
        """Update an existing tag."""
        try:
            db_tag = TagDao.get_tag_by_id(db, tag_id)
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
                db_tag.slug = TagDao.generate_slug(tag.name)
            db.commit()
            db.refresh(db_tag)
            logger.info(f"Updated tag: {db_tag.name} (ID: {db_tag.id})")
            return db_tag
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating tag {tag_id}: {e}")
            raise

    @staticmethod
    def delete_tag(db: Session, tag_id: int):
        """Delete a tag."""
        try:
            db_tag = TagDao.get_tag_by_id(db, tag_id)
            if not db_tag:
                return False
            db.delete(db_tag)
            db.commit()
            logger.info(f"Deleted tag: {db_tag.name} (ID: {db_tag.id})")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting tag {tag_id}: {e}")
            raise