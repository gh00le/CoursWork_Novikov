"use client";

export default function ErrorPage({ reset }) {
  return (
    <section className="error-state">
      <h1>Не удалось загрузить страницу</h1>
      <p>Проверьте, что Backend запущен, и попробуйте ещё раз.</p>
      <button className="button" type="button" onClick={() => reset()}>
        Повторить
      </button>
    </section>
  );
}
