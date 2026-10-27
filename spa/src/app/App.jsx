import { lazy, Suspense } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";

import { useCart } from "../features/cart/context/useCart";
import HomePage from "../pages/HomePage";

const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const ProductPage = lazy(() => import("../pages/ProductPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));

function App() {
  const { itemsCount } = useCart();

  return (
    <div className="app">
      <header className="header">
        <Link className="brand" to="/">
          Simple Shop SPA
        </Link>
        <nav className="nav" aria-label="Основная навигация">
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink to="/cart">Корзина ({itemsCount})</NavLink>
        </nav>
      </header>

      <main className="container">
        <Suspense fallback={<p role="status">Загрузка страницы...</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<section><h1>Страница не найдена</h1><Link to="/catalog">Перейти в каталог</Link></section>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
