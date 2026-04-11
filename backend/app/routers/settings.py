from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UserSettingsUpdate, UserSettingsResponse
from ..models import UserSettings, User
from ..utils.security import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    """Get user settings or create default if not exists."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id, theme="system", language="zh-CN")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's settings."""
    return get_or_create_settings(db, current_user.id)


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    settings_update: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's settings."""
    settings = get_or_create_settings(db, current_user.id)
    
    if settings_update.theme is not None:
        if settings_update.theme not in ["light", "dark", "system"]:
            raise HTTPException(status_code=400, detail="Invalid theme value")
        settings.theme = settings_update.theme
    
    if settings_update.language is not None:
        settings.language = settings_update.language
    
    db.commit()
    db.refresh(settings)
    return settings
