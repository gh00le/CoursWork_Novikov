from decimal import Decimal

from app.database import Base, SessionLocal, engine
from app.models import Category, Product


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_database():
    db = SessionLocal()

    try:
        if db.query(Product).count() > 0:
            return

        electronics = Category(name="Электроника")
        home = Category(name="Дом")
        books = Category(name="Книги")

        db.add_all([electronics, home, books])
        db.flush()

        products = [
            Product(
                name="Ноутбук",
                description="Учебный ноутбук для работы и повседневных задач.",
                price=Decimal("74990.00"),
                stock=12,
                image_url="/images/products/laptop.jpg",
                category_id=electronics.id,
            ),
            Product(
                name="Беспроводная мышь",
                description="Компактная мышь с беспроводным подключением.",
                price=Decimal("2490.00"),
                stock=35,
                image_url="/images/products/mouse.jpg",
                category_id=electronics.id,
            ),
            Product(
                name="Клавиатура",
                description="Полноразмерная клавиатура для работы за компьютером.",
                price=Decimal("3990.00"),
                stock=20,
                image_url="/images/products/keyboard.jpg",
                category_id=electronics.id,
            ),
            Product(
                name="Настольная лампа",
                description="Лампа для рабочего стола с регулируемым наклоном.",
                price=Decimal("2990.00"),
                stock=18,
                image_url="/images/products/lamp.jpg",
                category_id=home.id,
            ),
            Product(
                name="Термокружка",
                description="Термокружка объёмом 450 мл.",
                price=Decimal("1890.00"),
                stock=25,
                image_url="/images/products/mug.jpg",
                category_id=home.id,
            ),
            Product(
                name="Python для начинающих",
                description="Учебная книга с базовыми примерами программирования.",
                price=Decimal("1590.00"),
                stock=30,
                image_url="/images/products/python-book.jpg",
                category_id=books.id,
            ),
        ]

        db.add_all(products)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    seed_database()
