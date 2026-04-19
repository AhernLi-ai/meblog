"""Service layer for Settings - business logic."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..schemas import SiteSettingsResponse
from ..models import SiteSettings
from ..dao import SettingsDao


class SettingsService:
    @staticmethod
    def get_or_create_site_settings(db: Session) -> SiteSettings:
        """Get site settings or create default if not exists."""
        settings = SettingsDao.get_site_settings(db)
        if not settings:
            settings = SettingsDao.create_site_settings(db)
        return settings

    @staticmethod
    def get_site_settings_service(db: Session) -> SiteSettingsResponse:
        """Get public site settings (no auth required)."""
        return SettingsService.get_or_create_site_settings(db)