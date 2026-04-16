"""API layer for Settings - HTTP handling."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..schemas import UserSettingsUpdate, UserSettingsResponse, SiteSettingsResponse
from ..services import get_settings_service, update_settings_service, get_site_settings_service
from ..utils.security import get_current_user
from ..models import User

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get current user's settings."""
    return get_settings_service(db, current_user)


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    settings_update: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Update current user's settings."""
    return update_settings_service(db, settings_update, current_user)


@router.get("/site", response_model=SiteSettingsResponse)
def get_site_settings(db: Session = Depends(get_db)):
    """Get public site settings (no auth required)."""
    return get_site_settings_service(db)
