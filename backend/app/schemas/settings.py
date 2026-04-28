from pydantic import BaseModel
from typing import Optional


class SiteSettingsResponse(BaseModel):
    """Public site settings response (no auth required)."""
    id: str
    wechat_qr_url: Optional[str] = None
    wechat_guide_text: str
    wechat_show_on_article: bool
    wechat_show_in_sidebar: bool
    footer_github_url: Optional[str] = None
    beian_icp: Optional[str] = None

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    """Admin update payload for site settings."""
    wechat_qr_url: Optional[str] = None
    wechat_guide_text: Optional[str] = None
    wechat_show_on_article: Optional[bool] = None
    wechat_show_in_sidebar: Optional[bool] = None
    footer_github_url: Optional[str] = None
    beian_icp: Optional[str] = None
