from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth import require_admin
from backend.models import CategoryModel, MenuModel, UserModel, get_db
from backend.schemas import (
    Category,
    CategoryCreate,
    CategoryUpdate,
    MenuItem,
    MenuItemCreate,
    MenuItemUpdate,
)

router = APIRouter()


@router.get("/categories", response_model=list[Category])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(CategoryModel).all()
    return categories


@router.get("/categories/{category_id}", response_model=Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(CategoryModel).filter(
        CategoryModel.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/categories", response_model=Category)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_admin),
):
    existing = db.query(CategoryModel).filter(
        CategoryModel.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400,
                            detail="Category with this name already exists")

    db_category = CategoryModel(
        name=category.name,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=Category)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_admin),
):
    db_category = db.query(CategoryModel).filter(
        CategoryModel.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    if category_update.name is not None:
        existing = db.query(CategoryModel).filter(
            CategoryModel.name == category_update.name,
            CategoryModel.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Category with this name already exists")
        db_category.name = category_update.name

    if category_update.description is not None:
        db_category.description = category_update.description

    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_admin),
):
    db_category = db.query(CategoryModel).filter(
        CategoryModel.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}


@router.get("/menu", response_model=list[MenuItem])
def get_menu(
    category: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(MenuModel)

    if category:
        query = query.filter(
            MenuModel.categories.any(
                CategoryModel.name == category))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (MenuModel.name.ilike(search_term)) |
            (MenuModel.description.ilike(search_term))
        )

    items = query.all()
    return items


@router.get("/menu/{item_id}", response_model=MenuItem)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuModel).filter(MenuModel.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


@router.post("/menu", response_model=MenuItem)
def create_menu_item(
    item: MenuItemCreate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_admin),
):
    db_item = MenuModel(
        name=item.name,
        description=item.description,
        price=item.price,
        image=item.image
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    if item.category_ids:
        categories = db.query(CategoryModel).filter(
            CategoryModel.id.in_(item.category_ids)).all()
        db_item.categories = categories
        db.commit()
        db.refresh(db_item)

    return db_item


@router.put("/menu/{item_id}", response_model=MenuItem)
def update_menu_item(
    item_id: int,
    item_update: MenuItemUpdate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_admin),
):
    db_item = db.query(MenuModel).filter(MenuModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if item_update.name is not None:
        db_item.name = item_update.name
    if item_update.description is not None:
        db_item.description = item_update.description
    if item_update.price is not None:
        db_item.price = item_update.price
    if item_update.image is not None:
        db_item.image = item_update.image

    if item_update.category_ids is not None:
        categories = db.query(CategoryModel).filter(
            CategoryModel.id.in_(item_update.category_ids)
        ).all()
        db_item.categories = categories

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/menu/{item_id}")
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_admin),
):
    db_item = db.query(MenuModel).filter(MenuModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Menu item deleted successfully"}
