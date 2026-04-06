from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional, List, Tuple
from ..models import Post, Category, Tag, User
from ..schemas import PostCreate, PostUpdate


def get_posts(
    db: Session,
    page: int = 1,
    size: int = 10,
    category_slug: Optional[str] = None,
    tag_slug: Optional[str] = None,
    q: Optional[str] = None,
    include_unpublished: bool = False
) -> Tuple[List[Post], int]:
    query = db.query(Post).options(
        joinedload(Post.category),
        joinedload(Post.tags),
        joinedload(Post.author)
    ).filter(Post.is_deleted == False)

    if not include_unpublished:
        query = query.filter(Post.status == "published")

    # Filter by category
    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)

    # Filter by tag
    if tag_slug:
        query = query.join(Post.tags).filter(Tag.slug == tag_slug)

    # Search by title or content
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Post.title.ilike(search),
                Post.content.ilike(search)
            )
        )

    # Total count
    total = query.count()

    # Pagination
    query = query.order_by(Post.created_at.desc())
    query = query.offset((page - 1) * size).limit(size)

    posts = query.all()
    return posts, total


def get_post_by_id(db: Session, post_id: int) -> Optional[Post]:
    return db.query(Post).options(
        joinedload(Post.category),
        joinedload(Post.tags),
        joinedload(Post.author)
    ).filter(Post.id == post_id, Post.is_deleted == False).first()


def get_post_by_slug(db: Session, slug: str) -> Optional[Post]:
    post = db.query(Post).options(
        joinedload(Post.category),
        joinedload(Post.tags),
        joinedload(Post.author)
    ).filter(Post.slug == slug, Post.is_deleted == False).first()
    if post:
        # Increment view count
        post.view_count += 1
        db.commit()
        db.refresh(post)
    return post


def create_post(db: Session, post: PostCreate, user_id: int) -> Post:
    from ..utils.slug import generate_slug
    slug = generate_slug(post.title)
    # Ensure slug is unique
    counter = 1
    original_slug = slug
    while db.query(Post).filter(Post.slug == slug).first():
        slug = f"{original_slug}-{counter}"
        counter += 1

    db_post = Post(
        title=post.title,
        slug=slug,
        content=post.content,
        summary=post.summary or post.content[:200] + "..." if len(post.content) > 200 else post.content,
        category_id=post.category_id,
        status=post.status,
        user_id=user_id,
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Add tags
    if post.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()
        db_post.tags = tags
        db.commit()
        db.refresh(db_post)

    return db_post


def update_post(db: Session, post_id: int, post: PostUpdate) -> Optional[Post]:
    db_post = get_post_by_id(db, post_id)
    if not db_post:
        return None

    if post.title is not None:
        db_post.title = post.title
        # Regenerate slug from new title
        from ..utils.slug import generate_slug
        slug = generate_slug(post.title)
        counter = 1
        original_slug = slug
        while db.query(Post).filter(Post.slug == slug, Post.id != post_id).first():
            slug = f"{original_slug}-{counter}"
            counter += 1
        db_post.slug = slug

    if post.content is not None:
        db_post.content = post.content
    if post.summary is not None:
        db_post.summary = post.summary
    if post.category_id is not None:
        db_post.category_id = post.category_id
    if post.status is not None:
        db_post.status = post.status

    if post.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()
        db_post.tags = tags

    db.commit()
    db.refresh(db_post)
    return db_post


def delete_post(db: Session, post_id: int) -> bool:
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        return False
    db_post.is_deleted = True
    db.commit()
    return True


def get_post_count_by_category(db: Session, category_id: int) -> int:
    return db.query(Post).filter(
        Post.category_id == category_id,
        Post.is_deleted == False,
        Post.status == "published"
    ).count()


def get_post_count_by_tag(db: Session, tag_id: int) -> int:
    return db.query(Post).filter(
        Post.tags.any(Tag.id == tag_id),
        Post.is_deleted == False,
        Post.status == "published"
    ).count()
