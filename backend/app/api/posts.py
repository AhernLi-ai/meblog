     1|"""API layer for Posts - HTTP handling."""
     2|from fastapi import APIRouter, Depends, HTTPException, status, Request
     3|from sqlalchemy.orm import Session
     4|from typing import Optional
     5|from app.database import get_db
     6|from app.schemas import PostCreate, PostUpdate, PostResponse, PostListResponse, LikeStatusResponse
     7|from app.services import PostService
     8|from app.utils.security import get_current_user
     9|from app.models import User
    10|
    11|router = APIRouter(prefix="/posts", tags=["Posts"])
    12|
    13|
    14|@router.get("", response_model=PostListResponse)
    15|def list_posts(
    16|    page: int = Query(1, ge=1),
    17|    size: int = Query(10, ge=1, le=100),
    18|    project: Optional[str] = None,
    19|    tag: Optional[str] = None,
    20|    q: Optional[str] = None,
    21|    db: Session = Depends(get_db),
    22|    current_user: Optional[User] = Depends(get_current_user)
    23|):
    24|    return PostService.list_posts(db, page=page, size=size, project=project, tag=tag, q=q, current_user=current_user)
    25|
    26|
    27|@router.get("/{id_or_slug}", response_model=PostResponse)
    28|def get_post(
    29|    id_or_slug: str,
    30|    request: Request,
    31|    db: Session = Depends(get_db),
    32|    current_user: Optional[User] = Depends(get_current_user)
    33|):
    34|    return PostService.get_post(db, id_or_slug, request, current_user)
    35|
    36|
    37|@router.post("", response_model=PostResponse, status_code=201)
    38|def create_new_post(
    39|    post: PostCreate,
    40|    db: Session = Depends(get_db),
    41|    current_user: Optional[User] = Depends(get_current_user)
    42|):
    43|    return PostService.create_post(db, post, current_user)
    44|
    45|
    46|@router.put("/{post_id}", response_model=PostResponse)
    47|def update_existing_post(
    48|    post_id: int,
    49|    post: PostUpdate,
    50|    db: Session = Depends(get_db),
    51|    current_user: Optional[User] = Depends(get_current_user)
    52|):
    53|    return PostService.update_post(db, post_id, post, current_user)
    54|
    55|
    56|@router.delete("/{post_id}", status_code=204)
    57|def delete_existing_post(
    58|    post_id: int,
    59|    db: Session = Depends(get_db),
    60|    current_user: Optional[User] = Depends(get_current_user)
    61|):
    62|    PostService.delete_post(db, post_id, current_user)
    63|    return None
    64|
    65|
    66|@router.get("/{slug}/like", response_model=LikeStatusResponse)
    67|def get_like_status(
    68|    slug: str,
    69|    request: Request,
    70|    db: Session = Depends(get_db),
    71|):
    72|    return PostService.get_like_status(db, slug, request)
    73|
    74|
    75|@router.post("/{slug}/like", response_model=LikeStatusResponse)
    76|def toggle_like(
    77|    slug: str,
    78|    request: Request,
    79|    db: Session = Depends(get_db),
    80|):
    81|    return PostService.toggle_like(db, slug, request)
    82|