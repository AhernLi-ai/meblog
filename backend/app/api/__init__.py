# Copyright 2026 布谷布谷科技
# Licensed under the Apache License, Version 2.0

from .auth import router as auth_router
from .posts import router as posts_router
from .project import router as projects_router
from .tags import router as tags_router
from .settings import router as settings_router
from .stats import router as stats_router
from .about import router as about_router
from .comments import router as comments_router

__all__ = [
    "auth_router",
    "posts_router",
    "projects_router",
    "tags_router",
    "settings_router",
    "stats_router",
    "about_router",
    "comments_router",
]
