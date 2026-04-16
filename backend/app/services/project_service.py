"""Service layer for Project - business logic."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from ..dao import get_projects, get_project_by_id, get_project_by_slug, create_project, update_project, delete_project


def list_projects_service(db: Session) -> List[ProjectResponse]:
    """Get all projects."""
    return get_projects(db)


def get_project_by_slug_service(db: Session, slug: str) -> ProjectResponse:
    """Get a project by slug."""
    project = get_project_by_slug(db, slug)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def create_project_service(
    db: Session,
    project: ProjectCreate,
) -> ProjectResponse:
    """Create a new project. Requires authentication."""
    try:
        return create_project(db, project)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def update_project_service(
    db: Session,
    project_id: int,
    project: ProjectUpdate,
) -> ProjectResponse:
    """Update an existing project. Requires authentication."""
    try:
        updated = update_project(db, project_id, project)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


def delete_project_service(db: Session, project_id: int) -> None:
    """Delete a project. Requires authentication."""
    try:
        success = delete_project(db, project_id)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
