"""
DAO layer for Project - database CRUD operations.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Project, Post
from app.schemas import ProjectCreate, ProjectUpdate
from app.utils.slug import generate_slug
from app.utils.logger import logger


class ProjectDao:
    """Data Access Object for Project operations."""
    
    @staticmethod
    def get_projects(db: Session):
        """Get all projects with post count."""
        try:
            # Get projects with post count (only published and non-deleted posts)
            projects = db.query(
                Project,
                func.count(Post.id).label("post_count")
            ).outerjoin(Post, (Post.project_id == Project.id) & (Post.is_deleted == False) & (Post.status == "published")
            ).group_by(Project.id).all()

            result = []
            for proj, count in projects:
                proj.post_count = count
                result.append(proj)
            return result
        except Exception as e:
            logger.error(f"Error getting projects: {e}")
            raise

    @staticmethod
    def get_project_by_id(db: Session, project_id: int):
        """Get project by ID."""
        try:
            return db.query(Project).filter(Project.id == project_id).first()
        except Exception as e:
            logger.error(f"Error getting project by ID {project_id}: {e}")
            raise

    @staticmethod
    def get_project_by_slug(db: Session, slug: str):
        """Get project by slug."""
        try:
            return db.query(Project).filter(Project.slug == slug).first()
        except Exception as e:
            logger.error(f"Error getting project by slug {slug}: {e}")
            raise

    @staticmethod
    def create_project(db: Session, project: ProjectCreate):
        """Create a new project."""
        try:
            # Check for duplicate name
            existing = db.query(Project).filter(Project.name == project.name).first()
            if existing:
                raise ValueError("Project with this name already exists")
            slug = generate_slug(project.name)
            db_project = Project(name=project.name, slug=slug, cover=project.cover)
            db.add(db_project)
            db.commit()
            db.refresh(db_project)
            logger.info(f"Created project: {db_project.name} (ID: {db_project.id})")
            return db_project
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating project: {e}")
            raise

    @staticmethod
    def update_project(db: Session, project_id: int, project: ProjectUpdate):
        """Update an existing project."""
        try:
            db_project = ProjectDao.get_project_by_id(db, project_id)
            if not db_project:
                return None
            if project.name is not None:
                # Check for duplicate name (excluding current project)
                existing = db.query(Project).filter(
                    Project.name == project.name,
                    Project.id != project_id
                ).first()
                if existing:
                    raise ValueError("Project with this name already exists")
                db_project.name = project.name
                db_project.slug = generate_slug(project.name)
            if project.cover is not None:
                db_project.cover = project.cover
            db.commit()
            db.refresh(db_project)
            logger.info(f"Updated project: {db_project.name} (ID: {db_project.id})")
            return db_project
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating project {project_id}: {e}")
            raise

    @staticmethod
    def delete_project(db: Session, project_id: int):
        """Delete a project."""
        try:
            db_project = ProjectDao.get_project_by_id(db, project_id)
            if not db_project:
                return False
            # Check if project has posts
            post_count = db.query(Post).filter(
                Post.project_id == project_id,
                Post.is_deleted == False
            ).count()
            if post_count > 0:
                raise ValueError("Project has posts, cannot delete")
            db.delete(db_project)
            db.commit()
            logger.info(f"Deleted project: {db_project.name} (ID: {db_project.id})")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting project {project_id}: {e}")
            raise