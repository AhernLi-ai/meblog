import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, SiteSettings
from ..schemas import AboutResponse, AboutUpdate
from ..utils.security import get_current_admin_user, get_current_user

router = APIRouter(prefix="/about", tags=["About"])


def get_first_admin_user(db: Session) -> User:
    """Get the first admin user for the about page. Falls back to first user."""
    admin = db.query(User).filter(User.is_admin == True).first()
    if admin:
        return admin
    return db.query(User).first()


def get_or_create_site_settings(db: Session) -> SiteSettings:
    """Get site settings or create default if not exists."""
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings(
            wechat_guide_text="扫码关注公众号，获取更多精彩内容",
            wechat_show_on_article=True,
            wechat_show_in_sidebar=True,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=AboutResponse)
def get_about(db: Session = Depends(get_db)):
    """Get public about page data (博主信息 + 站点设置). No auth required."""
    user = get_first_admin_user(db)
    site_settings = get_or_create_site_settings(db)

    # Parse tech_stack JSON
    tech_stack = []
    if user.tech_stack:
        try:
            tech_stack = json.loads(user.tech_stack)
        except json.JSONDecodeError:
            tech_stack = []

    return AboutResponse(
        username=user.username,
        avatar_url=user.avatar_url,
        bio=user.bio,
        tech_stack=tech_stack,
        github_url=user.github_url,
        zhihu_url=user.zhihu_url,
        twitter_url=user.twitter_url,
        wechat_id=user.wechat_id,
        wechat_qr_url=site_settings.wechat_qr_url,
        wechat_guide_text=site_settings.wechat_guide_text,
    )


@router.put("", response_model=AboutResponse)
def update_about(
    update_data: AboutUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Update about page data (admin only)."""
    # Get the admin user to update (the current admin)
    user = get_first_admin_user(db)

    # Update fields if provided
    if update_data.username is not None:
        user.username = update_data.username
    if update_data.avatar_url is not None:
        user.avatar_url = update_data.avatar_url
    if update_data.bio is not None:
        user.bio = update_data.bio
    if update_data.tech_stack is not None:
        user.tech_stack = json.dumps(update_data.tech_stack, ensure_ascii=False)
    if update_data.github_url is not None:
        user.github_url = update_data.github_url
    if update_data.zhihu_url is not None:
        user.zhihu_url = update_data.zhihu_url
    if update_data.twitter_url is not None:
        user.twitter_url = update_data.twitter_url
    if update_data.wechat_id is not None:
        user.wechat_id = update_data.wechat_id

    db.commit()
    db.refresh(user)

    # Return updated about data
    site_settings = get_or_create_site_settings(db)
    tech_stack = []
    if user.tech_stack:
        try:
            tech_stack = json.loads(user.tech_stack)
        except json.JSONDecodeError:
            tech_stack = []

    return AboutResponse(
        username=user.username,
        avatar_url=user.avatar_url,
        bio=user.bio,
        tech_stack=tech_stack,
        github_url=user.github_url,
        zhihu_url=user.zhihu_url,
        twitter_url=user.twitter_url,
        wechat_id=user.wechat_id,
        wechat_qr_url=site_settings.wechat_qr_url,
        wechat_guide_text=site_settings.wechat_guide_text,
    )
