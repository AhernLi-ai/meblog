"""DAO layer for Settings - database CRUD operations."""
from sqlalchemy.orm import Session
from ..models import UserSettings, SiteSettings


def get_user_settings(db: Session, user_id: int) -> UserSettings:
    """Get user settings or return None if not exists."""
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def create_user_settings(db: Session, user_id: int) -> UserSettings:
    """Create default user settings."""
    settings = UserSettings(user_id=user_id, theme="system", language="zh-CN")
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


def update_user_settings(
    db: Session,
    settings: UserSettings,
    settings_update
) -> UserSettings:
    """Update user settings fields."""
    if settings_update.theme is not None:
        settings.theme = settings_update.theme
    if settings_update.language is not None:
        settings.language = settings_update.language
    db.commit()
    db.refresh(settings)
    return settings
