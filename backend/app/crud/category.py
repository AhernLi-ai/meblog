from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Category, Post
from ..schemas import CategoryCreate, CategoryUpdate
from ..utils.slug import generate_slug


def get_categories(db: Session):
    # Get categories with post count (only published and non-deleted posts)
    categories = db.query(
        Category,
        func.count(Post.id).label("post_count")
    ).outerjoin(Post, (Post.category_id == Category.id) & (Post.is_deleted == False) & (Post.status == "published")
    ).group_by(Category.id).all()

    result = []
    for cat, count in categories:
        cat.post_count = count
        result.append(cat)
    return result


def get_category_by_id(db: Session, category_id: int):
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_slug(db: Session, slug: str):
    return db.query(Category).filter(Category.slug == slug).first()


def create_category(db: Session, category: CategoryCreate):
    slug = generate_slug(category.name)
    db_category = Category(name=category.name, slug=slug)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: CategoryUpdate):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return None
    if category.name is not None:
        db_category.name = category.name
        db_category.slug = generate_slug(category.name)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return False
    # Check if category has posts
    post_count = db.query(Post).filter(
        Post.category_id == category_id,
        Post.is_deleted == False
    ).count()
    if post_count > 0:
        raise ValueError("Category has posts, cannot delete")
    db.delete(db_category)
    db.commit()
    return True
