import { Link } from "react-router-dom";
export default function HomePage() {
  return <section className="py-5">
    <p className="text-secondary text-uppercase small">Курсовая работа</p>
    <h1>Прототип интернет-магазина на React</h1>
    <p className="lead">Эта версия работает как SPA: после первой загрузки переходы между
      страницами выполняются клиентским React Router без полной перезагрузки документа.</p>
    <Link className="btn btn-primary" to="/catalog">Открыть каталог</Link>
  </section>;
}
