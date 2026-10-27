import { proxyToBackend } from "../../../lib/proxy";

export async function POST(request) {
  const body = await request.text();

  return proxyToBackend("/api/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}
