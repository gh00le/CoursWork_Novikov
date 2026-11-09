import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCategories, getProducts } from "../features/catalog/api";
import ProductCard from "../features/catalog/components/ProductCard";
import type { Category, Product } from "../types/shop";

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getCategories().then(setCategories).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Не удалось загрузить категории");
    });
  }, []);
  useEffect(() => {
    let active = true;
    // Состояние загрузки обновляется до отправки запроса, чтобы не показывать старые данные.
    void getProducts({ categoryId, search: appliedSearch })
      .then((data) => { if (active) { setProducts(data); setError(""); } })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Не удалось загрузить каталог"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [categoryId, appliedSearch]);
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAppliedSearch(search.trim());
  }
  return <section>
    <p className="text-secondary small">SPA</p>
    <h1>Каталог товаров</h1>
    <div className="row g-3 my-3 align-items-end">
      <form className="col-12 col-md-8 d-flex gap-2" onSubmit={handleSearch}>
        <input className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Название товара" />
        <button className="btn btn-primary" type="submit">Найти</button>
      </form>
      <div className="col-12 col-md-4">
        <select className="form-select" value={categoryId} onChange={(event) => { setLoading(true);setCategoryId(event.target.value); }}>
          <option value="">Все категории</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>
    </div>
    {error && <p className="text-danger" role="alert">{error}</p>}
    {loading && <p role="status">Загрузка каталога...</p>}
    {!loading && !error && <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>}
    {!loading && !error && products.length === 0 && <p>По заданным условиям товары не найдены.</p>}
  </section>;
}
