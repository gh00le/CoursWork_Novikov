const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export async function apiRequest(path, options = {}) {
  const { headers: requestHeaders, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...requestHeaders,
    },
  });

  if (!response.ok) {
    let message = "Ошибка при обращении к серверу";
    try {
      const errorData = await response.json();
      message = Array.isArray(errorData.detail)
        ? errorData.detail.map((item) => item.msg).join("; ")
        : (errorData.detail ?? message);
    } catch {
      message = `HTTP ${response.status}`;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
