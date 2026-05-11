import os
import sys
from sqlalchemy import text

# Add the parent directory to sys.path to allow importing backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import SessionLocal, engine, Base, UserModel, CategoryModel, MenuModel
from backend.auth import get_password_hash

def seed_data():
    db = SessionLocal()
    try:
        print("Starting seeding process...")
        
        # 1. Reset Database using SQLAlchemy ORM (Safe and prevents SQL vulnerabilities)
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Tables safely created via SQLAlchemy metadata.")

        # 2. Seed Admin User
        admin_user = db.query(UserModel).filter(UserModel.username == "admin").first()
        if not admin_user:
            admin_user = UserModel(
                username="admin",
                hashed_password=get_password_hash("admin12345"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created.")

        # 3. Seed Categories and Dishes
        menu_data = {
            "Супы": [
                {"name": "Борщ Московский", "price": 380, "img": "russian_borscht_soup.png", "desc": "Густой мясной суп со свеклой и говядиной."},
                {"name": "Щи суточные", "price": 340, "img": "russian_shchi_soup.png", "desc": "Из квашеной капусты, томленые в печи."}
            ],
            "Горячее": [
                {"name": "Пельмени Сибирские", "price": 440, "img": "russian_pelmeni_dumplings.png", "desc": "Ручная лепка, говядина и свинина."},
                {"name": "Бефстроганов", "price": 680, "img": "beef_stroganoff_with_puree.png", "desc": "Говядина в сметанном соусе с пюре."}
            ]
        }

        for cat_name, dishes in menu_data.items():
            category = db.query(CategoryModel).filter(CategoryModel.name == cat_name).first()
            if not category:
                category = CategoryModel(name=cat_name)
                db.add(category)
                db.commit()
                db.refresh(category)

            for item in dishes:
                dish = db.query(MenuModel).filter(MenuModel.name == item["name"]).first()
                if not dish:
                    new_dish = MenuModel(
                        name=item["name"],
                        description=item["desc"],
                        price=item["price"],
                        image=f"/static/images/{item['img']}"
                    )
                    new_dish.categories.append(category)
                    db.add(new_dish)
        
        db.commit()
        print("Success! Russian menu is ready.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
