"""
DAO layer for Post - database CRUD operations.
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List, Tuple
from app.models import Post, Project, Tag, User
from app.schemas import PostCreate, PostUpdate
from app.utils.slug import generate_unique_slug
from app.utils.logger import logger


class PostDao:
    """Data Access Object for Post operations."""
    
    @staticmethod
    def get_posts(
        db: Session,
        page: int = 1,
        size: int = 10,
        project_slug: Optional[str] = None,
        tag_slug: Optional[str] = None,
        q: Optional[str] = None,
        include_unpublished: bool = False
    ) -> Tuple[List[Post], int]:
        """Get paginated posts with filters."""
        try:
            query = db.query(Post).options(
                joinedload(Post.project),
                joinedload(Post.tags),
                joinedload(Post.author)
            ).filter(Post.is_deleted == False)

            if not include_unpublished:
                query = query.filter(Post.status == "published")

            if project_slug:
                query = query.filter(Post.project.has(Project.slug == project_slug))

            if tag_slug:
                query = query.filter(Post.tags.any(Tag.slug == tag_slug))

            if q:
                search = f"%{q}%"
                query = query.filter(
                    or_(
                        Post.title.ilike(search),
                        Post.content.ilike(search)
                    )
                )

            total = query.count()
            query = query.order_by(Post.created_at.desc())
            query = query.offset((page - 1) * size).limit(size)
            posts = query.all()
            return posts, total
        except Exception as e:
            logger.error(f"Error getting posts: {e}")
            raise

    @staticmethod
    def get_post_by_id(db: Session, post_id: int, include_unpublished: bool = False) -> Optional[Post]:
        """Get post by ID."""
        try:
            query = db.query(Post).options(
                joinedload(Post.project),
                joinedload(Post.tags),
                joinedload(Post.author)
            ).filter(Post.id == post_id, Post.is_deleted == False)
            if not include_unpublished:
                query = query.filter(Post.status == "published")
            return query.first()
        except Exception as e:
            logger.error(f"Error getting post by ID {post_id}: {e}")
            raise

    @staticmethod
    def get_post_by_slug(db: Session, slug: str, include_unpublished: bool = False) -> Optional[Post]:
        """Get post by slug and increment view count."""
        try:
            query = db.query(Post).options(
                joinedload(Post.project),
                joinedload(Post.tags),
                joinedload(Post.author)
            ).filter(Post.slug == slug, Post.is_deleted == False)
            if not include_unpublished:
                query = query.filter(Post.status == "published")
            post = query.first()
            if post:
                post.view_count += 1
                db.commit()
                db.refresh(post)
            return post
        except Exception as e:
            db.rollback()
            logger.error(f"Error getting post by slug {slug}: {e}")
            raise

    @staticmethod
    def create_post(db: Session, post: PostCreate, user_id: int) -> Post:
        """Create a new post."""
        try:
            slug = generate_unique_slug(db, post.title)
            
            db_post = Post(
                title=post.title,
                slug=slug,
                content=post.content,
                summary=post.summary or (post.content[:200] + "..." if len(post.content) > 200 else post.content),
                project_id=post.project_id,
                status=post.status,
                user_id=user_id,
            )
            db.add(db_post)
            db.commit()
            db.refresh(db_post)

            if post.tag_ids:
                tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()
                db_post.tags = tags
                db.commit()
                db.refresh(db_post)

            logger.info(f"Created post: {db_post.title} (ID: {db_post.id})")
            return db_post
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating post: {e}")
            raise

    @staticmethod
    def update_post(db: Session, post_id: int, post: PostUpdate, include_unpublished: bool = False) -> Optional[Post]:
        """Update an existing post."""
        try:
            db_post = PostDao.get_post_by_id(db, post_id, include_unpublished=include_unpublished)
            if not db_post:
                return None

            if post.title is not None:
                db_post.title = post.title
                db_post.slug = generate_unique_slug(db, post.title, exclude_id=post_id)

            if post.content is not None:
                db_post.content = post.content
            if post.summary is not None:
                db_post.summary = post.summary
            if 'project_id' in post.model_fields_set:
                db_post.project_id = post.project_id
            if post.status is not None:
                db_post.status = post.status

            if post.tag_ids is not None:
                tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()
                db_post.tags = tags

            db.commit()
            db.refresh(db_post)
            logger.info(f"Updated post: {db_post.title} (ID: {db_post.id})")
            return db_post
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating post {post_id}: {e}")
            raise

    @staticmethod
    def delete_post(db: Session, post_id: int) -> bool:
        """Soft delete a post."""
        try:
            db_post = db.query(Post).filter(Post.id == post_id).first()
            if not db_post:
                return False
            db_post.is_deleted = True
            db.commit()
            logger.info(f"Soft deleted post: {db_post.title} (ID: {db_post.id})")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting post {post_id}: {e}")
            raise

    @staticmethod
    def get_post_count_by_project(db: Session, project_id: int) -> int:
        """Get published post count for a project."""
        try:
            return db.query(Post).filter(
                Post.project_id == project_id,
                Post.is_deleted == False,
                Post.status == "published"
            ).count()
        except Exception as e:
            logger.error(f"Error getting post count for project {project_id}: {e}")
            raise

    @staticmethod
    def get_post_count_by_tag(db: Session, tag_id: int) -> int:
        """Get published post count for a tag."""
        try:
            return db.query(Post).filter(
                Post.tags.any(Tag.id == tag_id),
                Post.is_deleted == False,
                Post.status == "published"
            ).count()
        except Exception as e:
            logger.error(f"Error getting post count for tag {tag_id}: {e}")
            raise