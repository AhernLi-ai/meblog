"""DAO layer for About - database CRUD operations."""
import json
from sqlalchemy.orm import Session
from ..models import AuthorSettings, SiteSettings
from ..schemas import AboutUpdate


def get_author_settings(db: Session) -> AuthorSettings:
    """Get author settings or return None if not exists."""
    return db.query(AuthorSettings).first()


def create_author_settings(db: Session) -> AuthorSettings:
    """Create default author settings."""
    settings = AuthorSettings(username="颜如玉")
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def get_site_settings(db: Session) -> SiteSettings:
    """Get site settings or return None if not exists."""
    return db.query(SiteSettings).first()


def create_site_settings(db: Session) -> SiteSettings:
    """Create default site settings."""
    settings = SiteSettings(
        wechat_guide_text="扫码关注公众号，获取更多精彩内容",
        wechat_show_on_article=True,
        wechat_show_in_sidebar=True,
    )
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_author_settings(
    db: Session,
    author: AuthorSettings,
    update_data: AboutUpdate
) -> AuthorSettings:
    """Update author settings fields."""
    if update_data.username is not None:
        author.username = update_data.username
    if update_data.avatar_url is not None:
        author.avatar_url = update_data.avatar_url
    if update_data.bio is not None:
        author.bio = update_data.bio
    if update_data.tech_stack is not None:
        author.tech_stack = json.dumps(update_data.tech_stack, ensure_ascii=False)
    if update_data.github_url is not None:
        author.github_url = update_data.github_url
    if update_data.zhihu_url is not None:
        author.zhihu_url = update_data.zhihu_url
    if update_data.twitter_url is not None:
        author.twitter_url = update_data.twitter_url
    if update_data.wechat_id is not None:
        author.wechat_id = update_data.wechat_id
    
    db.commit()
    db.refresh(author)
    return author


def parse_tech_stack(author: AuthorSettings) -> list:
    """Parse tech_stack JSON field."""
    if author.tech_stack:
        try:
            return json.loads(author.tech_stack)
        except json.JSONDecodeError:
            pass
    return []
