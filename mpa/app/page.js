import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Курсовая работа</p>
        <h1>Прототип интернет-магазина на Next.js</h1>

        <p className="hero-text">
          Эта версия используется как MPA/SSR-прототип. Каталог и карточка
          товара формируются на сервере Next.js, а интерактивные элементы
          корзины работают на клиенте после гидратации.
        </p>

        <Link className="button" href="/catalog">
          Открыть каталог
        </Link>
      </div>
    </section>
  );
}
