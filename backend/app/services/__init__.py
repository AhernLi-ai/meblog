# Copyright 2026 布谷布谷科技
# Licensed under the Apache License, Version 2.0

# Comment services
from .comment_service import (
    get_comments_service,
    add_comment_service,
    remove_comment_service,
)

# Post services
from .post_service import (
    list_posts_service,
    get_post_service,
    create_post_service,
    update_post_service,
    delete_post_service,
    get_like_status_service,
    toggle_like_service,
)

# Tag services
from .tag_service import (
    list_tags_service,
    create_tag_service,
    update_tag_service,
    delete_tag_service,
)

# Project services
from .project_service import (
    list_projects_service,
    get_project_by_slug_service,
    create_project_service,
    update_project_service,
    delete_project_service,
)

# Settings services
from .settings_service import (
    get_settings_service,
    update_settings_service,
    get_site_settings_service,
)

# Stats services
from .stats_service import (
    log_access_service,
    get_unique_visitors_service,
    get_trends_service,
    get_popular_posts_service,
    get_summary_service,
)

# About services
from .about_service import (
    get_about_service,
    update_about_service,
)

# Auth services
from .auth_service import (
    register_service,
    login_service,
    get_me_service,
)

__all__ = [
    # Comment
    "get_comments_service",
    "add_comment_service",
    "remove_comment_service",
    # Post
    "list_posts_service",
    "get_post_service",
    "create_post_service",
    "update_post_service",
    "delete_post_service",
    "get_like_status_service",
    "toggle_like_service",
    # Tag
    "list_tags_service",
    "create_tag_service",
    "update_tag_service",
    "delete_tag_service",
    # Project
    "list_projects_service",
    "get_project_by_slug_service",
    "create_project_service",
    "update_project_service",
    "delete_project_service",
    # Settings
    "get_settings_service",
    "update_settings_service",
    "get_site_settings_service",
    # Stats
    "log_access_service",
    "get_unique_visitors_service",
    "get_trends_service",
    "get_popular_posts_service",
    "get_summary_service",
    # About
    "get_about_service",
    "update_about_service",
    # Auth
    "register_service",
    "login_service",
    "get_me_service",
]
