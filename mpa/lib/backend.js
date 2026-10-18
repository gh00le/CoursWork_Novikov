const BACKEND_URL =
  process.env.API_URL_SERVER ?? "http://localhost:8000"; // Адрес FastAPI для серверных запросов Next.js.

export async function backendRequest(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...options,
  });

  if (!response.ok) {
    let message = "Ошибка обращения к FastAPI";

    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      message = `HTTP ${response.status}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
