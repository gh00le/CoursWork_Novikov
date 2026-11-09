import Link from "next/link";
export default function ShopHeader() {
  return <header className="navbar navbar-expand bg-light border-bottom px-3 py-3 mb-4 flex-wrap gap-3">
    <Link className="navbar-brand fw-semibold" href="/">Simple Shop MPA</Link>
    <nav className="navbar-nav flex-row flex-wrap gap-3" aria-label="Основная навигация">
      <Link className="nav-link" href="/">Главная</Link>
      <Link className="nav-link" href="/catalog">Каталог</Link>
      <Link className="nav-link" href="/cart">Корзина</Link>
    </nav>
  </header>;
}
