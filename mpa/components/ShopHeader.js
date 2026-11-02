import Link from "next/link";

export default function ShopHeader() {
  return (
    <header className="header navbar navbar-expand bg-light">
      <Link className="brand" href="/">Simple Shop MPA</Link>
      <nav className="nav navbar-nav flex-row" aria-label="Основная навигация">
        <Link href="/">Главная</Link>
        <Link href="/catalog">Каталог</Link>
        <Link href="/cart">Корзина</Link>
      </nav>
    </header>
  );
}
