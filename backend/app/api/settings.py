"""API layer for Settings - HTTP handling."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SiteSettingsResponse
from app.services import SettingsService


router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/site", response_model=SiteSettingsResponse)
def get_site_settings(db: Session = Depends(get_db)):
    """Get public site settings (no auth required)."""
    return SettingsService.get_site_settings_service(db)