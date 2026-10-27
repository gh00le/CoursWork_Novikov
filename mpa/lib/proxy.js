const BACKEND_URL = (process.env.API_URL_SERVER ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export async function proxyToBackend(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      cache: "no-store",
      ...options,
    });
  }
 catch {
    return Response.json(
      { detail: "Backend недоступен. Убедитесь, что FastAPI запущен." },
      { status: 502 },
    );
  }

  const body = await response.text();
  const headers = new Headers();
  const contentType = response.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);

  return new Response(body || null, {
    status: response.status,
    headers,
  });
}
