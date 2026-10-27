import { Suspense } from "react";

import ProductCard from "../../features/catalog/ProductCard";
import { backendRequest } from "../../lib/backend";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Каталог товаров | Simple Shop MPA",
  description: "Каталог товаров с поиском и фильтрацией по категориям.",
};

async function CatalogContent({ searchParams }) {
  const params = await searchParams;
  const categoryId = params?.category_id ?? "";
  const search = params?.search ?? "";

  const query = new URLSearchParams();
  if (categoryId) query.set("category_id", categoryId);
  if (search) query.set("search", search);
  const queryString = query.toString();

  const [categories, products] = await Promise.all([
    backendRequest("/api/v1/categories"),
    backendRequest(`/api/v1/products${queryString ? `?${queryString}` : ""}`),
  ]);

  return (
    <>
      <form className="filters" method="get">
        <input name="search" defaultValue={search} placeholder="Название товара" />
        <select name="category_id" defaultValue={categoryId}>
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button className="button" type="submit">Применить</button>
      </form>

      <div className="products-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
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
      <Suspense fallback={<p role="status">Загрузка каталога...</p>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
