import { proxyToBackend } from "../../../lib/proxy";

export async function POST(request) {
  const body = await request.text();

  return proxyToBackend("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}
