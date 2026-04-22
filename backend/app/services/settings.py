"""Service layer for Settings - business logic."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import SiteSettingsResponse, SiteSettingsUpdate
from app.models import SiteSettings, Admin
from app.dao import SettingsDao


class SettingsService:
    @staticmethod
    async def get_or_create_site_settings(db: AsyncSession) -> SiteSettings:
        settings = await SettingsDao.get_site_settings(db)
        if not settings:
            settings = await SettingsDao.create_site_settings(db)
        return settings

    @staticmethod
    async def update_site_settings_service(
        db: AsyncSession,
        payload: SiteSettingsUpdate,
        current_admin: Admin,
    ) -> SiteSettingsResponse:
        try:
            settings = await SettingsService.get_or_create_site_settings(db)
            updated = await SettingsDao.update_site_settings(
                db,
                settings,
                payload,
                admin_id=current_admin.id,
            )
            return SiteSettingsResponse.model_validate(updated)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update site settings: {e}")
