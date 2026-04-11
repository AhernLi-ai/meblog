from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AboutResponse(BaseModel):
    """Public about page data:博主信息 + 站点设置"""
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    tech_stack: Optional[List[str]] = []
    github_url: Optional[str] = None
    zhihu_url: Optional[str] = None
    twitter_url: Optional[str] = None
    wechat_id: Optional[str] = None
    # Site settings (wechat QR复用)
    wechat_qr_url: Optional[str] = None
    wechat_guide_text: str = "扫码关注公众号，获取更多精彩内容"

    class Config:
        from_attributes = True


class AboutUpdate(BaseModel):
    """Update about data (admin only)"""
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    github_url: Optional[str] = None
    zhihu_url: Optional[str] = None
    twitter_url: Optional[str] = None
    wechat_id: Optional[str] = None
