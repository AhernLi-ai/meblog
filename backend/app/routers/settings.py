from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UserSettingsUpdate, UserSettingsResponse, SiteSettingsResponse
from ..models import UserSettings, SiteSettings, User
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


def get_or_create_site_settings(db: Session) -> SiteSettings:
    """Get site settings or create default if not exists."""
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings(
            wechat_guide_text="扫码关注公众号，获取更多精彩内容",
            wechat_show_on_article=True,
            wechat_show_in_sidebar=True,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get current user's settings."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return get_or_create_settings(db, current_user.id)


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    settings_update: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Update current user's settings."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
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


@router.get("/site", response_model=SiteSettingsResponse)
def get_site_settings(db: Session = Depends(get_db)):
    """Get public site settings (no auth required)."""
    return get_or_create_site_settings(db)
