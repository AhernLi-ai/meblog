from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from ..crud import (
    get_categories, get_category_by_id, create_category,
    update_category, delete_category
)
from ..utils.security import get_current_user
from ..models import User

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_new_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_category(db, category)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_existing_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = update_category(db, category_id, category)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}", status_code=204)
def delete_existing_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        success = delete_category(db, category_id)
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return None
