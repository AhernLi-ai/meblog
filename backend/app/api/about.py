"""API layer for About - HTTP handling."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import AboutResponse, AboutUpdate
from ..services import get_about_service, update_about_service
from ..utils.security import get_current_admin_user

router = APIRouter(prefix="/about", tags=["About"])


@router.get("", response_model=AboutResponse)
def get_about(db: Session = Depends(get_db)):
    """Get public about page data (博主信息 + 站点设置). No auth required."""
    return get_about_service(db)


@router.put("", response_model=AboutResponse)
def update_about(
    update_data: AboutUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
):
    """Update about page data (admin only)."""
    return update_about_service(db, update_data)
