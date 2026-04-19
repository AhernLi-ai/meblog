"""
Service layer for Project - business logic.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.dao import ProjectDao
from app.utils.logger import logger


class ProjectService:
    """Service class for Project business logic."""
    
    @staticmethod
    def list_projects(db: Session) -> List[ProjectResponse]:
        """Get all projects."""
        try:
            projects = ProjectDao.get_projects(db)
            return projects
        except Exception as e:
            logger.error(f"Error listing projects: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def get_project_by_slug(db: Session, slug: str) -> ProjectResponse:
        """Get a project by slug."""
        try:
            project = ProjectDao.get_project_by_slug(db, slug)
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            return project
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting project by slug {slug}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def create_project(
        db: Session,
        project: ProjectCreate,
    ) -> ProjectResponse:
        """Create a new project. Requires authentication."""
        try:
            return ProjectDao.create_project(db, project)
        except ValueError as e:
            logger.warning(f"Validation error creating project: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def update_project(
        db: Session,
        project_id: int,
        project: ProjectUpdate,
    ) -> ProjectResponse:
        """Update an existing project. Requires authentication."""
        try:
            updated = ProjectDao.update_project(db, project_id, project)
            if not updated:
                raise HTTPException(status_code=404, detail="Project not found")
            return updated
        except ValueError as e:
            logger.warning(f"Validation error updating project {project_id}: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating project {project_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def delete_project(db: Session, project_id: int) -> None:
        """Delete a project. Requires authentication."""
        try:
            success = ProjectDao.delete_project(db, project_id)
            if not success:
                raise HTTPException(status_code=404, detail="Project not found")
        except ValueError as e:
            logger.warning(f"Validation error deleting project {project_id}: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting project {project_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")