import Link from "next/link";

export default function ShopHeader() {
  return (
    <header className="header">
      <Link className="brand" href="/">Simple Shop MPA</Link>
      <nav className="nav" aria-label="Основная навигация">
        <Link href="/">Главная</Link>
        <Link href="/catalog">Каталог</Link>
        <Link href="/cart">Корзина</Link>
      </nav>
    </header>
  );
}
