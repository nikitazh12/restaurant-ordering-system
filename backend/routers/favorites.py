from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth import get_current_user
from backend.models import FavoriteModel, UserModel, get_db
from backend.schemas import Favorite, FavoriteCreate

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[Favorite])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    favorites = db.query(FavoriteModel).filter(
        FavoriteModel.user_id == current_user.id).all()
    return favorites


@router.post("", response_model=Favorite, status_code=status.HTTP_201_CREATED)
def add_to_favorites(
    item: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    existing_item = (
        db.query(FavoriteModel) .filter(
            FavoriteModel.user_id == current_user.id,
            FavoriteModel.menu_item_id == item.menu_item_id) .first())

    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item already in favorites")

    new_item = FavoriteModel(
        user_id=current_user.id,
        menu_item_id=item.menu_item_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_favorites(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    favorite_item = (
        db.query(FavoriteModel) .filter(
            FavoriteModel.id == item_id,
            FavoriteModel.user_id == current_user.id) .first())

    if not favorite_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite item not found")

    db.delete(favorite_item)
    db.commit()
    return None
