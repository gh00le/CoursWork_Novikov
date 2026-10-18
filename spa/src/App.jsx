import { Link, NavLink, Route, Routes } from "react-router-dom";

import { useCart } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";

function App() {
  const { itemsCount } = useCart();

  return (
    <div className="app">
      <header className="header">
        <Link className="brand" to="/">
          Simple Shop SPA
        </Link>

        <nav className="nav">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink to="/cart">Корзина ({itemsCount})</NavLink>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
