"""DAO layer for Project - database CRUD operations."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Project, Post
from ..schemas import ProjectCreate, ProjectUpdate
from ..utils.slug import generate_slug


def get_projects(db: Session):
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


def get_project_by_id(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_by_slug(db: Session, slug: str):
    return db.query(Project).filter(Project.slug == slug).first()


# Aliases for backwards compatibility
get_category_by_id = get_project_by_id
get_category_by_slug = get_project_by_slug


def create_project(db: Session, project: ProjectCreate):
    # Check for duplicate name
    existing = db.query(Project).filter(Project.name == project.name).first()
    if existing:
        raise ValueError("Project with this name already exists")
    slug = generate_slug(project.name)
    db_project = Project(name=project.name, slug=slug, cover=project.cover)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


# Alias
create_category = create_project


def update_project(db: Session, project_id: int, project: ProjectUpdate):
    db_project = get_project_by_id(db, project_id)
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
    return db_project


# Alias
update_category = update_project


def delete_project(db: Session, project_id: int):
    db_project = get_project_by_id(db, project_id)
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
    return True


# Alias
delete_category = delete_project
