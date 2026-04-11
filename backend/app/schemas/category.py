from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str = Field(..., max_length=50)
    cover: Optional[str] = Field(None)


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    cover: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    slug: str
    cover: Optional[str] = None
    created_at: datetime
    post_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Aliases for backwards compatibility
CategoryCreate = ProjectCreate
CategoryUpdate = ProjectUpdate
CategoryResponse = ProjectResponse
