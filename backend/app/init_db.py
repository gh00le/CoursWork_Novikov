import asyncio
from decimal import Decimal
from sqlalchemy import func, select
from app.database import AsyncSessionLocal, Base, engine
from app.models import Category, Product

SEED_PRODUCTS = [
    {
        "name": "Ноутбук",
        "description": "Учебный ноутбук для работы и повседневных задач.",
        "price": Decimal("74990.00"),
        "stock": 12,
        "image_url": "/images/products/laptop.jpg",
        "category": "Электроника",
    },
    {
        "name": "Беспроводная мышь",
        "description": "Компактная мышь с беспроводным подключением.",
        "price": Decimal("2490.00"),
        "stock": 35,
        "image_url": "/images/products/mouse.jpg",
        "category": "Электроника",
    },
    {
        "name": "Клавиатура",
        "description": "Полноразмерная клавиатура для работы за компьютером.",
        "price": Decimal("3990.00"),
        "stock": 20,
        "image_url": "/images/products/keyboard.jpg",
        "category": "Электроника",
    },
    {
        "name": "Настольная лампа",
        "description": "Лампа для рабочего стола с регулируемым наклоном.",
        "price": Decimal("2990.00"),
        "stock": 18,
        "image_url": "/images/products/lamp.jpg",
        "category": "Дом",
    },
    {
        "name": "Термокружка",
        "description": "Термокружка объёмом 450 мл.",
        "price": Decimal("1890.00"),
        "stock": 25,
        "image_url": "/images/products/mug.jpg",
        "category": "Дом",
    },
    {
        "name": "Python для начинающих",
        "description": "Учебная книга с базовыми примерами программирования.",
        "price": Decimal("1590.00"),
        "stock": 30,
        "image_url": "/images/products/python-book.jpg",
        "category": "Книги",
    },
]


async def create_tables() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def seed_database() -> None:
    async with AsyncSessionLocal() as db:
        product_count = await db.scalar(select(func.count()).select_from(Product))
        if product_count and product_count > 0:
            return

        category_names = sorted({item["category"] for item in SEED_PRODUCTS})
        categories: dict[str, Category] = {}
        for name in category_names:
            result = await db.execute(select(Category).where(Category.name == name))
            category = result.scalar_one_or_none()
            if category is None:
                category = Category(name=name)
                db.add(category)
                await db.flush()
            categories[name] = category

        for item in SEED_PRODUCTS:
            db.add(
                Product(
                    name=item["name"],
                    description=item["description"],
                    price=item["price"],
                    stock=item["stock"],
                    image_url=item["image_url"],
                    category_id=categories[item["category"]].id,
                )
            )
        await db.commit()


async def main() -> None:
    await create_tables()
    await seed_database()
    print("Database is ready. Demo products were inserted when needed.")


if __name__ == "__main__":
    asyncio.run(main())
