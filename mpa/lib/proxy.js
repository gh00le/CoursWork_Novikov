const BACKEND_URL =
  process.env.API_URL_SERVER ?? "http://localhost:8000"; // Серверный адрес FastAPI, недоступный пользователю напрямую через этот модуль.

export async function proxyToBackend(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...options,
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
