# Copyright 2026 布谷布谷科技
# Licensed under the Apache License, Version 2.0

# Comment DAO
from .comment import (
    get_comments_by_post_slug,
    create_comment,
    delete_comment,
    get_comment_by_id,
)

# Post DAO
from .post import (
    get_posts,
    get_post_by_id,
    get_post_by_slug,
    create_post,
    update_post,
    delete_post,
    get_post_count_by_project,
    get_post_count_by_tag,
)

# Tag DAO
from .tag import (
    get_tags,
    get_tag_by_id,
    get_tag_by_slug,
    create_tag,
    update_tag,
    delete_tag,
)

# Project DAO
from .project import (
    get_projects,
    get_project_by_id,
    get_project_by_slug,
    create_project,
    update_project,
    delete_project,
)

# Settings DAO
from .settings import (
    get_user_settings,
    create_user_settings,
    get_site_settings,
    create_site_settings,
    update_user_settings,
)

# Stats DAO
from .stats import (
    log_access,
    get_unique_visitors_count,
    get_trends_data,
    get_popular_posts_data,
    get_summary_data,
)

# About DAO
from .about import (
    get_author_settings,
    create_author_settings,
    get_site_settings as get_about_site_settings,
    create_site_settings as create_about_site_settings,
    update_author_settings,
    parse_tech_stack,
)

# User DAO
from .user import (
    get_user_by_username,
    get_user_by_email,
    get_user_by_id,
    create_user,
)

__all__ = [
    # Comment
    "get_comments_by_post_slug",
    "create_comment",
    "delete_comment",
    "get_comment_by_id",
    # Post
    "get_posts",
    "get_post_by_id",
    "get_post_by_slug",
    "create_post",
    "update_post",
    "delete_post",
    "get_post_count_by_project",
    "get_post_count_by_tag",
    # Tag
    "get_tags",
    "get_tag_by_id",
    "get_tag_by_slug",
    "create_tag",
    "update_tag",
    "delete_tag",
    # Project
    "get_projects",
    "get_project_by_id",
    "get_project_by_slug",
    "create_project",
    "update_project",
    "delete_project",
    # Settings
    "get_user_settings",
    "create_user_settings",
    "get_site_settings",
    "create_site_settings",
    "update_user_settings",
    # Stats
    "log_access",
    "get_unique_visitors_count",
    "get_trends_data",
    "get_popular_posts_data",
    "get_summary_data",
    # About
    "get_author_settings",
    "create_author_settings",
    "update_author_settings",
    "parse_tech_stack",
    # User
    "get_user_by_username",
    "get_user_by_email",
    "get_user_by_id",
    "create_user",
]
