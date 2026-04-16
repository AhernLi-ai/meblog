"""Service layer for About - business logic."""
import json
from sqlalchemy.orm import Session
from ..schemas import AboutResponse, AboutUpdate
from ..dao import (
    get_author_settings,
    create_author_settings,
    get_site_settings,
    create_site_settings,
    update_author_settings,
    parse_tech_stack,
)


def get_or_create_author_settings(db: Session):
    """Get author settings or create default if not exists."""
    settings = get_author_settings(db)
    if not settings:
        settings = create_author_settings(db)
    return settings


def get_or_create_site_settings(db: Session):
    """Get site settings or create default if not exists."""
    settings = get_site_settings(db)
    if not settings:
        settings = create_site_settings(db)
    return settings


def build_about_response(db: Session) -> AboutResponse:
    """Build AboutResponse from author and site settings."""
    author = get_or_create_author_settings(db)
    site_settings = get_or_create_site_settings(db)
    tech_stack = parse_tech_stack(author)

    return AboutResponse(
        username=author.username,
        avatar_url=author.avatar_url,
        bio=author.bio,
        tech_stack=tech_stack,
        github_url=author.github_url,
        zhihu_url=author.zhihu_url,
        twitter_url=author.twitter_url,
        wechat_id=author.wechat_id,
        wechat_qr_url=site_settings.wechat_qr_url,
        wechat_guide_text=site_settings.wechat_guide_text,
    )


def get_about_service(db: Session) -> AboutResponse:
    """Get public about page data (博主信息 + 站点设置). No auth required."""
    return build_about_response(db)


def update_about_service(
    db: Session,
    update_data: AboutUpdate,
) -> AboutResponse:
    """Update about page data (admin only)."""
    author = get_or_create_author_settings(db)
    update_author_settings(db, author, update_data)
    # Return updated about data
    return build_about_response(db)
