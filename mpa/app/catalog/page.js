import { Suspense } from "react";

import AddToCartButton from "../../components/AddToCartButton";
import { backendRequest } from "../../lib/backend";
import { formatPrice } from "../../lib/formatPrice";

async function CatalogContent({ searchParams }) {
  const params = await searchParams;

  const categoryId = params?.category_id ?? "";
  const search = params?.search ?? "";

  const query = new URLSearchParams();

  if (categoryId) {
    query.set("category_id", categoryId);
  }

  if (search) {
    query.set("search", search);
  }

  const queryString = query.toString();

  const [categories, products] = await Promise.all([
    backendRequest("/api/categories"),
    backendRequest(`/api/products${queryString ? `?${queryString}` : ""}`),
  ]);

  return (
    <>
      <form className="filters" method="get">
        <input
          name="search"
          defaultValue={search}
          placeholder="Название товара"
        />

        <select name="category_id" defaultValue={categoryId}>
          <option value="">Все категории</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button className="button" type="submit">
          Применить
        </button>
      </form>

      <div className="products-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <img
              className="product-image"
              src={product.image_url ?? "/images/products/placeholder.svg"}
              alt={product.name}
            />

            <div className="product-card-body">
              <h3>{product.name}</h3>
              <p className="muted">{product.description}</p>
              <p className="price">{formatPrice(product.price)}</p>
              <p className="muted">На складе: {product.stock}</p>

              <div className="product-actions">
                <a
                  className="button button-secondary"
                  href={`/products/${product.id}`}
                >
                  Подробнее
                </a>

                <AddToCartButton
                  productId={product.id}
                  disabled={product.stock === 0}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {products.length === 0 && <p>Товары не найдены.</p>}
    </>
  );
}

export default function CatalogPage({ searchParams }) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MPA / SSR</p>
          <h1>Каталог товаров</h1>
        </div>
      </div>

      <Suspense fallback={<p>Загрузка каталога...</p>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
