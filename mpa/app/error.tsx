"use client";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="alert alert-danger" role="alert">
    <h1 className="h4">Ошибка загрузки страницы</h1>
    <p>{error.message}</p>
    <button className="btn btn-outline-danger" type="button" onClick={reset}>Повторить</button>
  </div>;
}
