// Сервер Next.js обращается к тому же Nginx gateway, что и клиентский браузер.
const API_URL_SERVER = (process.env.API_URL_SERVER || "http://localhost:8080").replace(/\/$/, "");
export async function backendRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL_SERVER}${path}`, { cache: "no-store", ...options });
  if (!response.ok) {
    let message = "Ошибка обращения к FastAPI";
    try {
      const data: { detail?: string | { msg: string }[] } = await response.json();
      message = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join("; ")
        : (data.detail ?? message);
    } catch { message = `HTTP ${response.status}`; }
    throw new Error(message);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
