import { proxyToBackend } from "../../../lib/proxy";

export async function POST() {
  return proxyToBackend("/api/v1/cart", {
    method: "POST",
  });
}
