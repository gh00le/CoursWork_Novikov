export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

// Пустой base URL означает same-origin; в Docker все запросы проходят Nginx.
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    let message = "Ошибка при обращении к серверу";
    try {
      const errorData: { detail?: string | { msg: string }[] } = await response.json();
      message = Array.isArray(errorData.detail)
        ? errorData.detail.map((item) => item.msg).join("; ")
        : (errorData.detail ?? message);
    } catch {
      message = `HTTP ${response.status}`;
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
