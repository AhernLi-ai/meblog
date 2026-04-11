from .auth import router as auth_router
from .posts import router as posts_router
from .projects import router as projects_router
from .tags import router as tags_router
from .settings import router as settings_router
from .stats import router as stats_router

__all__ = ["auth_router", "posts_router", "projects_router", "tags_router", "settings_router", "stats_router"]
