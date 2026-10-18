import { useEffect, useState } from "react";

import { getCategories, getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";

function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const data = await getProducts({
          categoryId,
          search: appliedSearch,
        });

        setProducts(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [categoryId, appliedSearch]);

  function handleSearch(event) {
    event.preventDefault();
    setAppliedSearch(search.trim());
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SPA</p>
          <h1>Каталог товаров</h1>
        </div>
      </div>

      <div className="filters">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Название товара"
          />
          <button className="button" type="submit">
            Найти
          </button>
        </form>

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Все категории</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Загрузка каталога...</p>}

      {!loading && !error && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p>По заданным условиям товары не найдены.</p>
      )}
    </section>
  );
}

export default CatalogPage;
