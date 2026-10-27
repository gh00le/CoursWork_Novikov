const BACKEND_URL = (process.env.API_URL_SERVER ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export async function backendRequest(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...options,
  });

  if (!response.ok) {
    let message = "Ошибка обращения к FastAPI";
    try {
      const data = await response.json();
      message = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join("; ")
        : (data.detail ?? message);
    }
   catch {
      message = `HTTP ${response.status}`;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}
