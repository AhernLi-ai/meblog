"""DAO layer for Settings - database CRUD operations."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import SiteSettings
from app.schemas import SiteSettingsUpdate


class SettingsDao:
    @staticmethod
    async def get_site_settings(db: AsyncSession) -> SiteSettings | None:
        return (await db.execute(select(SiteSettings))).scalar_one_or_none()

    @staticmethod
    async def create_site_settings(db: AsyncSession) -> SiteSettings:
        settings = SiteSettings(
            wechat_guide_text="扫码关注公众号，获取更多精彩内容",
            wechat_show_on_article=True,
            wechat_show_in_sidebar=True,
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        return settings

    @staticmethod
    async def update_site_settings(
        db: AsyncSession,
        settings: SiteSettings,
        payload: SiteSettingsUpdate,
        admin_id: str | None = None,
    ) -> SiteSettings:
        if payload.wechat_qr_url is not None:
            settings.wechat_qr_url = payload.wechat_qr_url
        if payload.wechat_guide_text is not None:
            settings.wechat_guide_text = payload.wechat_guide_text
        if payload.wechat_show_on_article is not None:
            settings.wechat_show_on_article = payload.wechat_show_on_article
        if payload.wechat_show_in_sidebar is not None:
            settings.wechat_show_in_sidebar = payload.wechat_show_in_sidebar
        if admin_id is not None:
            settings.updated_by = admin_id

        await db.commit()
        await db.refresh(settings)
        return settings