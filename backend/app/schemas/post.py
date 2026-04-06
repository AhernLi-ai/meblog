from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategoryInfo(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class TagInfo(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class AuthorInfo(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class PostListItem(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str]
    view_count: int
    status: str
    created_at: datetime
    category: CategoryInfo
    tags: List[TagInfo] = []

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    summary: Optional[str]
    view_count: int
    status: str
    created_at: datetime
    updated_at: datetime
    category: CategoryInfo
    tags: List[TagInfo] = []
    author: AuthorInfo

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    items: List[PostListItem]
    total: int
    page: int
    size: int
    pages: int


class PostCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    summary: Optional[str] = Field(None, max_length=500)
    category_id: int
    tag_ids: List[int] = []
    status: str = "draft"


class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    summary: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    status: Optional[str] = None
