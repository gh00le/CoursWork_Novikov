import Link from "next/link";
export default function HomePage() {
  return <section className="py-5">
    <p className="text-secondary text-uppercase small">Курсовая работа</p>
    <h1>Прототип интернет-магазина на Next.js</h1>
    <p className="lead">Эта версия используется как MPA/SSR-прототип. Каталог и карточка товара
      формируются на сервере Next.js, а интерактивная корзина работает на клиенте после гидратации.</p>
    <Link className="btn btn-primary" href="/catalog">Открыть каталог</Link>
  </section>;
}
