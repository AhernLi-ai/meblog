"""Service layer for About - business logic."""
import json
from sqlalchemy.orm import Session
from ..schemas import AboutResponse, AboutUpdate
from ..dao import AboutDao


class AboutService:
    @staticmethod
    def get_or_create_author_settings(db: Session):
        """Get author settings or create default if not exists."""
        settings = AboutDao.get_author_settings(db)
        if not settings:
            settings = AboutDao.create_author_settings(db)
        return settings

    @staticmethod
    def get_or_create_site_settings(db: Session):
        """Get site settings or create default if not exists."""
        settings = AboutDao.get_site_settings(db)
        if not settings:
            settings = AboutDao.create_site_settings(db)
        return settings

    @staticmethod
    def build_about_response(db: Session) -> AboutResponse:
        """Build AboutResponse from author and site settings."""
        author = AboutService.get_or_create_author_settings(db)
        site_settings = AboutService.get_or_create_site_settings(db)
        tech_stack = AboutDao.parse_tech_stack(author)

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

    @staticmethod
    def get_about_service(db: Session) -> AboutResponse:
        """Get public about page data (博主信息 + 站点设置). No auth required."""
        return AboutService.build_about_response(db)

    @staticmethod
    def update_about_service(
        db: Session,
        update_data: AboutUpdate,
    ) -> AboutResponse:
        """Update about page data (admin only)."""
        author = AboutService.get_or_create_author_settings(db)
        AboutDao.update_author_settings(db, author, update_data)
        # Return updated about data
        return AboutService.build_about_response(db)