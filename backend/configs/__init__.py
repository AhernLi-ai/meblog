import os
from typing import Union

from .base import settings as base_settings
from .test import test_settings
from .production import production_settings


def get_settings() -> Union[base_settings.__class__, test_settings.__class__, production_settings.__class__]:
    """Get appropriate settings based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "test":
        return test_settings
    elif env == "production":
        return production_settings
    else:
        return base_settings


# Default settings instance
settings = get_settings()