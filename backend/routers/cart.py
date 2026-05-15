from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth import get_current_user
from backend.models import CartItemModel, UserModel, get_db
from backend.schemas import CartItem, CartItemCreate, CartItemUpdate

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=list[CartItem])
def get_cart(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    cart_items = db.query(CartItemModel).filter(
        CartItemModel.user_id == current_user.id).all()
    return cart_items


@router.post("", response_model=CartItem, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    existing_item = (
        db.query(CartItemModel) .filter(
            CartItemModel.user_id == current_user.id,
            CartItemModel.menu_item_id == item.menu_item_id) .first())

    if existing_item:
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item

    new_item = CartItemModel(
        user_id=current_user.id,
        menu_item_id=item.menu_item_id,
        quantity=item.quantity)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/{item_id}", response_model=CartItem)
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    cart_item = (
        db.query(CartItemModel) .filter(
            CartItemModel.id == item_id,
            CartItemModel.user_id == current_user.id) .first())

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found")

    cart_item.quantity = item_update.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    cart_item = (
        db.query(CartItemModel) .filter(
            CartItemModel.id == item_id,
            CartItemModel.user_id == current_user.id) .first())

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return None


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db.query(CartItemModel).filter(
        CartItemModel.user_id == current_user.id).delete()
    db.commit()
    return None
