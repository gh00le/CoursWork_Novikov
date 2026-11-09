import { Suspense } from "react";
import type { Metadata } from "next";
import ProductCard from "../../features/catalog/ProductCard";
import { backendRequest } from "../../lib/backend";
import type { Category, Product } from "../../types/shop";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Каталог товаров | Simple Shop MPA",
  description: "Каталог товаров с поиском и фильтрацией по категориям.",
};
type SearchParams = Promise<{ category_id?: string; search?: string }>;
async function CatalogContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categoryId = params.category_id ?? "";
  const search = params.search ?? "";
  const query = new URLSearchParams();
  if (categoryId) query.set("category_id", categoryId);
  if (search) query.set("search", search);
  const qs = query.toString();
  const [categories, products] = await Promise.all([
    backendRequest<Category[]>("/api/v1/categories"),
    backendRequest<Product[]>(`/api/v1/products${qs ? `?${qs}` : ""}`),
  ]);
  return <>
    <form className="row g-2 my-4" method="get">
      <div className="col-12 col-md-6"><input className="form-control" name="search" defaultValue={search} placeholder="Название товара" /></div>
      <div className="col-12 col-md-4"><select className="form-select" name="category_id" defaultValue={categoryId}>
        <option value="">Все категории</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select></div>
      <div className="col-12 col-md-2"><button className="btn btn-primary" type="submit">Применить</button></div>
    </form>
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
    {products.length === 0 && <p>Товары не найдены.</p>}
  </>;
}
export default function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  return <section>
    <p className="text-secondary small">MPA / SSR</p><h1>Каталог товаров</h1>
    <Suspense fallback={<p role="status">Загрузка каталога...</p>}>
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  </section>;
}
