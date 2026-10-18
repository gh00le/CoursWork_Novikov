import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Курсовая работа</p>
        <h1>Прототип интернет-магазина на React</h1>
        <p className="hero-text">
          Эта версия работает как SPA: после первой загрузки переходы между
          страницами выполняются клиентским React Router без полной перезагрузки
          документа.
        </p>

        <Link className="button" to="/catalog">
          Открыть каталог
        </Link>
      </div>
    </section>
  );
}

export default HomePage;
