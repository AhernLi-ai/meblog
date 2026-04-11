import logging
import sys
from datetime import datetime
from pathlib import Path

# Configure logger
logger = logging.getLogger("meblog")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# File handler - log to backend/logs/app.log
log_dir = Path(__file__).parent.parent.parent / "logs"
log_dir.mkdir(exist_ok=True)
file_handler = logging.FileHandler(log_dir / "app.log", encoding="utf-8")
file_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)


def log_user_login(username: str, success: bool, ip: str = "unknown"):
    """Log user login attempt."""
    level = "INFO" if success else "WARNING"
    logger.log(logging.INFO if success else logging.WARNING, 
        f"LOGIN | user={username} | success={success} | ip={ip}")


def log_post_action(action: str, post_id: int, user_id: int, details: str = ""):
    """Log post create/update/delete actions."""
    logger.info(f"POST_{action.upper()} | post_id={post_id} | user_id={user_id} | {details}")


def log_project_action(action: str, project_id: int, user_id: int, details: str = ""):
    """Log project create/update/delete actions."""
    logger.info(f"PROJECT_{action.upper()} | project_id={project_id} | user_id={user_id} | {details}")


def log_tag_action(action: str, tag_id: int, user_id: int, details: str = ""):
    """Log tag create/update/delete actions."""
    logger.info(f"TAG_{action.upper()} | tag_id={tag_id} | user_id={user_id} | {details}")
