from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None  # light, dark, system
    language: Optional[str] = None


class UserSettingsResponse(BaseModel):
    id: str
    user_id: str
    theme: str
    language: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SiteSettingsResponse(BaseModel):
    """Public site settings response (no auth required)."""
    id: str
    wechat_qr_url: Optional[str] = None
    wechat_guide_text: str
    wechat_show_on_article: bool
    wechat_show_in_sidebar: bool

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    """Admin update payload for site settings."""
    wechat_qr_url: Optional[str] = None
    wechat_guide_text: Optional[str] = None
    wechat_show_on_article: Optional[bool] = None
    wechat_show_in_sidebar: Optional[bool] = None
