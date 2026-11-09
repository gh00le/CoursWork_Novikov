import { lazy, Suspense } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useCart } from "../features/cart/context/useCart";
import HomePage from "../pages/HomePage";
const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const ProductPage = lazy(() => import("../pages/ProductPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
export default function App() {
  const { itemsCount } = useCart();
  return (
    <div>
      <header className="navbar navbar-expand bg-light border-bottom px-3 py-3 mb-4 flex-wrap gap-3">
        <Link className="navbar-brand fw-semibold" to="/">Simple Shop SPA</Link>
        <nav className="navbar-nav flex-row flex-wrap gap-3" aria-label="Основная навигация">
          <NavLink className="nav-link" to="/" end>Главная</NavLink>
          <NavLink className="nav-link" to="/catalog">Каталог</NavLink>
          <NavLink className="nav-link" to="/cart">Корзина ({itemsCount})</NavLink>
        </nav>
      </header>
      <main className="container py-3">
        <Suspense fallback={<p role="status">Загрузка страницы...</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<p>Страница не найдена.</p>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
