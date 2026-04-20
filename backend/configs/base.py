from pydantic_settings import BaseSettings
from typing import Optional, List


class BaseSettingsConfig(BaseSettings):
    """Base configuration class with common settings"""
    
    # Project info
    PROJECT_NAME: str = "Meblog"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Site URL (used for sitemap, RSS feed, SEO)
    SITE_URL: str = "http://localhost:6000"
    
    # Database
    DATABASE_URL: str = "postgresql://test:test@116.62.176.216:6001/meblog_test"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"
    
    # Application
    APP_ENV: str = "development"

    class Config:
        case_sensitive = True
        env_file_encoding = "utf-8"
        env_file = ".env"
        extra = "ignore"


# Create settings instance
settings = BaseSettingsConfig()