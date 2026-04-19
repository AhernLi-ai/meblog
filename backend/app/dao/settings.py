"""DAO layer for Settings - database CRUD operations."""
from sqlalchemy.orm import Session
from ..models import SiteSettings


class SettingsDao:
    @staticmethod
    def get_site_settings(db: Session) -> SiteSettings:
        """Get site settings or return None if not exists."""
        return db.query(SiteSettings).first()

    @staticmethod
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