from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(20), default="system")  # light, dark, system
    language = Column(String(10), default="zh-CN")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="settings")


class SiteSettings(Base):
    """Site-wide settings for public configuration."""
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # WeChat QR code image URL
    wechat_qr_url = Column(Text, nullable=True)
    # Guidance text shown below the QR code
    wechat_guide_text = Column(String(200), default="扫码关注公众号，获取更多精彩内容")
    # Whether to show WeChat QR on article pages
    wechat_show_on_article = Column(Boolean, default=True)
    # Whether to show WeChat QR in sidebar
    wechat_show_in_sidebar = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuthorSettings(Base):
    """Single-row table storing the author profile for the About page.

    Previously these fields lived in the `users` table but are moved here
    since regular visitors never need user account data — only the author
    profile shown on the About page.
    """
    __tablename__ = "author_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), nullable=False)
    avatar_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    tech_stack = Column(Text, nullable=True)  # JSON string of tags list
    github_url = Column(String(500), nullable=True)
    zhihu_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    wechat_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
