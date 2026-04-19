"""API layer for Projects - HTTP handling."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services import ProjectService
from app.utils.security import get_current_user
from app.models import User

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return ProjectService.list_projects(db)


@router.get("/{slug}", response_model=ProjectResponse)
def get_project_by_slug_endpoint(slug: str, db: Session = Depends(get_db)):
    return ProjectService.get_project_by_slug(db, slug)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return ProjectService.create_project(db, project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_existing_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return ProjectService.update_project(db, project_id, project)


@router.delete("/{project_id}", status_code=204)
def delete_existing_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    ProjectService.delete_project(db, project_id)
    return None
