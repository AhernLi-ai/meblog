import os
# from typing import Union

from .base import settings as base_settings
# from .test import test_settings
# from .production import production_settings


def get_settings():
    """Get appropriate settings based on environment"""
    # Always use base_settings for local development
    return base_settings


# Default settings instance
settings = get_settings()