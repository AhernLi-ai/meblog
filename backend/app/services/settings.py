"""Service layer for Settings - business logic."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..schemas import UserSettingsUpdate, UserSettingsResponse, SiteSettingsResponse
from ..models import User, UserSettings, SiteSettings
from ..dao import get_user_settings, create_user_settings, get_site_settings, create_site_settings, update_user_settings


def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    """Get user settings or create default if not exists."""
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_user_settings(db, user_id)
    return settings


def get_or_create_site_settings(db: Session) -> SiteSettings:
    """Get site settings or create default if not exists."""
    settings = get_site_settings(db)
    if not settings:
        settings = create_site_settings(db)
    return settings


def get_settings_service(
    db: Session,
    current_user: User
) -> UserSettingsResponse:
    """Get current user's settings."""
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return get_or_create_settings(db, current_user.id)


def update_settings_service(
    db: Session,
    settings_update: UserSettingsUpdate,
    current_user: User
) -> UserSettingsResponse:
    """Update current user's settings."""
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    settings = get_or_create_settings(db, current_user.id)
    
    if settings_update.theme is not None:
        if settings_update.theme not in ["light", "dark", "system"]:
            raise HTTPException(status_code=400, detail="Invalid theme value")
    
    return update_user_settings(db, settings, settings_update)


def get_site_settings_service(db: Session) -> SiteSettingsResponse:
    """Get public site settings (no auth required)."""
    return get_or_create_site_settings(db)
