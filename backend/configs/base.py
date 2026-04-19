from pydantic_settings import BaseSettings
from typing import Optional


class BaseSettingsConfig(BaseSettings):
    """Base configuration class with common settings"""
    
    # Project info
    PROJECT_NAME: str = "Meblog"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Site URL (used for sitemap, RSS feed, SEO)
    SITE_URL: str = "http://localhost:6000"
    
    # Database
    DATABASE_URL: str = "sqlite:///./meblog.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    class Config:
        case_sensitive = True
        env_file_encoding = "utf-8"


# Create settings instance
settings = BaseSettingsConfig()