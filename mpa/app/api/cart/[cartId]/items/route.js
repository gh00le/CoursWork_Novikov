import { proxyToBackend } from "../../../../../lib/proxy";

export async function POST(request, context) {
  const { cartId } = await context.params;
  const body = await request.text();

  return proxyToBackend(`/api/cart/${cartId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}
