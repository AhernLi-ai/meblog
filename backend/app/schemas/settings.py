from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None  # light, dark, system
    language: Optional[str] = None


class UserSettingsResponse(BaseModel):
    id: int
    user_id: int
    theme: str
    language: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
