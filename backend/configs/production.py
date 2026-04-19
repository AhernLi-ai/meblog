from .base import BaseSettingsConfig


class ProductionSettings(BaseSettingsConfig):
    """Production environment configuration"""
    
    class Config:
        env_file = ".env.production"
        case_sensitive = True


# Create production settings instance
production_settings = ProductionSettings()