"""Service layer for About - business logic."""
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Admin
from app.schemas import AboutResponse, AboutUpdate
from app.dao import AboutDao


class AboutService:
    @staticmethod
    async def get_or_create_author_settings(db: AsyncSession, admin_id: str | None = None):
        settings = await AboutDao.get_author_settings(db)
        if not settings:
            settings = await AboutDao.create_author_settings(db, admin_id=admin_id)
        return settings

    @staticmethod
    async def get_or_create_site_settings(db: AsyncSession, admin_id: str | None = None):
        settings = await AboutDao.get_site_settings(db)
        if not settings:
            settings = await AboutDao.create_site_settings(db, admin_id=admin_id)
        return settings

    @staticmethod
    async def build_about_response(db: AsyncSession) -> AboutResponse:
        author = await AboutService.get_or_create_author_settings(db)
        site_settings = await AboutService.get_or_create_site_settings(db)
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
    async def get_about_service(db: AsyncSession) -> AboutResponse:
        return await AboutService.build_about_response(db)

    @staticmethod
    async def update_about_service(
        db: AsyncSession,
        update_data: AboutUpdate,
        current_admin: Admin,
    ) -> AboutResponse:
        author = await AboutService.get_or_create_author_settings(db, admin_id=current_admin.id)
        await AboutDao.update_author_settings(db, author, update_data, admin_id=current_admin.id)
        return await AboutService.build_about_response(db)