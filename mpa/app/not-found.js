import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="empty-state">
      <h1>Страница не найдена</h1>
      <p>Возможно, товар был удалён или адрес введён неправильно.</p>
      <Link className="button" href="/catalog">Перейти в каталог</Link>
    </section>
  );
}
