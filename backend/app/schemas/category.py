from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=50)


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime
    post_count: Optional[int] = 0

    class Config:
        from_attributes = True
