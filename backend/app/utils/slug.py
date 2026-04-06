import re
from slugify import slugify as python_slugify


def generate_slug(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    # Use python-slugify with reasonable settings
    slug = python_slugify(text, lowercase=True, max_length=200)
    return slug
