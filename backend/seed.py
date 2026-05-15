from backend.models import Base, CategoryModel, MenuModel, SessionLocal, UserModel, engine
from backend.auth import get_password_hash
import os
import sys

# Add the parent directory to sys.path to allow importing backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def seed_data():
    db = SessionLocal()
    try:
        print("Starting seeding process...")

        # 1. Reset Database using SQLAlchemy ORM (Safe and prevents SQL
        # vulnerabilities)
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Tables safely created via SQLAlchemy metadata.")

        # 2. Seed Admin User
        admin_user = db.query(UserModel).filter(
            UserModel.username == "admin").first()
        if not admin_user:
            admin_password = os.getenv("ADMIN_PASSWORD", "admin12345")
            admin_user = UserModel(
                username="admin",
                hashed_password=get_password_hash(admin_password),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created.")

        # 3. Seed Categories and Dishes
        menu_data = {
            "Супы": [
                {
                    "name": "Борщ Московский",
                    "price": 380,
                    "img": "russian_borscht_soup.png",
                    "desc": "Густой мясной суп со свеклой и говядиной."
                },
                {
                    "name": "Щи суточные",
                    "price": 340,
                    "img": "russian_shchi_soup.png",
                    "desc": "Из квашеной капусты, томленые в печи."
                },
                {
                    "name": "Солянка Мясная",
                    "price": 450,
                    "img": "russian_solyanka_soup.png",
                    "desc": "Наваристый суп с копченостями и оливками."
                },
                {
                    "name": "Уха Царская",
                    "price": 520,
                    "img": "russian_ukha_soup_royal.png",
                    "desc": "Из трех видов рыб с зеленью."
                }
            ],
            "Закуски": [
                {
                    "name": "Оливье",
                    "price": 420,
                    "img": "russian_olivier_salad.png",
                    "desc": "Классический рецепт с телячьим языком."
                },
                {
                    "name": "Сельдь под шубой",
                    "price": 310,
                    "img": "russian_herring_under_fur_coat.png",
                    "desc": "Слоеный салат со свеклой."
                },
                {
                    "name": "Винегрет",
                    "price": 280,
                    "img": "russian_vinegret_salad.png",
                    "desc": "С бочковыми грибами."
                },
                {
                    "name": "Холодец",
                    "price": 450,
                    "img": "russian_kholodets_aspic.png",
                    "desc": "Домашний из говядины с хреном."
                }
            ],
            "Горячее": [
                {
                    "name": "Пельмени Сибирские",
                    "price": 440,
                    "img": "russian_pelmeni_dumplings.png",
                    "desc": "Ручная лепка, говядина и свинина."
                },
                {
                    "name": "Бефстроганов",
                    "price": 680,
                    "img": "beef_stroganoff_with_puree.png",
                    "desc": "Говядина в сметанном соусе с пюре."
                },
                {
                    "name": "Пожарская котлета",
                    "price": 490,
                    "img": "pozharskaya_cutlet_dish.png",
                    "desc": "В хрустящих сухариках."
                },
                {
                    "name": "Голубцы",
                    "price": 460,
                    "img": "russian_golubtsi_cabbage_rolls_in_sauce.png",
                    "desc": "В томатно-сметанном соусе."
                }
            ],
            "Десерты": [
                {
                    "name": "Блины с икрой",
                    "price": 750,
                    "img": "russian_blini_with_caviar.png",
                    "desc": "С красной лососевой икрой."
                },
                {
                    "name": "Блины со сметаной",
                    "price": 250,
                    "img": "russian_blini_sweet_sour_cream.png",
                    "desc": "Сладкие со сметаной."
                },
                {
                    "name": "Пирожки печеные",
                    "price": 180,
                    "img": "russian_pirozki_set.png",
                    "desc": "С мясом, капустой, картошкой."
                },
                {
                    "name": "Медовик",
                    "price": 320,
                    "img": "russian_medovik_honey_cake.png",
                    "desc": "Классический рецепт."
                }
            ],
            "Напитки": [
                {
                    "name": "Морс Клюквенный",
                    "price": 150,
                    "img": "russian_cranberry_mors.png",
                    "desc": "Домашний морс из свежей клюквы."
                },
                {
                    "name": "Квас Домашний",
                    "price": 120,
                    "img": "russian_kvass.png",
                    "desc": "Традиционный хлебный квас."
                },
                {
                    "name": "Компот",
                    "price": 130,
                    "img": "russian_kompot.png",
                    "desc": "Из сухофруктов, как в детстве."
                },
                {
                    "name": "Чай с чабрецом",
                    "price": 200,
                    "img": "russian_tea_with_thyme.png",
                    "desc": "Черный чай с лесным чабрецом."
                }
            ]
        }

        for cat_name, dishes in menu_data.items():
            category = db.query(CategoryModel).filter(
                CategoryModel.name == cat_name).first()
            if not category:
                category = CategoryModel(name=cat_name)
                db.add(category)
                db.commit()
                db.refresh(category)

            for item in dishes:
                dish = db.query(MenuModel).filter(
                    MenuModel.name == item["name"]).first()
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
