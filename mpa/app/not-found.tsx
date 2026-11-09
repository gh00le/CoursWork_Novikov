import Link from "next/link";
export default function NotFoundPage() {
  return <section className="py-5"><h1>Страница не найдена</h1>
    <p>Такой страницы нет.</p><Link className="btn btn-primary" href="/">На главную</Link>
  </section>;
}
