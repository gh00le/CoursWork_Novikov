import { proxyToBackend } from "../../../../../../lib/proxy";

export async function PATCH(request, context) {
  const { cartId, itemId } = await context.params;
  const body = await request.text();

  return proxyToBackend(`/api/v1/cart/${cartId}/items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function DELETE(request, context) {
  const { cartId, itemId } = await context.params;

  return proxyToBackend(`/api/v1/cart/${cartId}/items/${itemId}`, {
    method: "DELETE",
  });
}
