import { proxyToBackend } from "../../../../lib/proxy";

export async function GET(request, context) {
  const { cartId } = await context.params;

  return proxyToBackend(`/api/v1/cart/${cartId}`);
}
