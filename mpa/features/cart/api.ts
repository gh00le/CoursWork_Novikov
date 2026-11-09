import type { Cart, CartCreated, Order } from "../../types/shop";
import { readCartId, saveCartId, clearCartId } from "./storage";
export { clearCartId } from "./storage";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

// Браузер обращается к общему /api/v1 через Nginx, не напрямую к FastAPI.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, options);
  if (!response.ok) {
    let message = "Не удалось выполнить операцию с корзиной";
    try {
      const data: { detail?: string | { msg: string }[] } = await response.json();
      message = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join("; ")
        : (data.detail ?? message);
    } catch { message = `HTTP ${response.status}`; }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
export function createCart(): Promise<CartCreated> {
  return request<CartCreated>("/cart", { method: "POST" });
}
export function getCart(cartId: number): Promise<Cart> {
  return request<Cart>(`/cart/${cartId}`);
}
export async function getOrCreateCartId(): Promise<number> {
  const savedId = readCartId();
  if (savedId) {
    try { await getCart(savedId); return savedId; }
    catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error;
      clearCartId();
    }
  }
  const created = await createCart();
  saveCartId(created.id);
  return created.id;
}
export function addCartItem(cartId: number, productId: number, quantity: number): Promise<Cart> {
  return request<Cart>(`/cart/${cartId}/items`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}
export function updateCartItem(cartId: number, itemId: number, quantity: number): Promise<Cart> {
  return request<Cart>(`/cart/${cartId}/items/${itemId}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }),
  });
}
export function removeCartItem(cartId: number, itemId: number): Promise<void> {
  return request<void>(`/cart/${cartId}/items/${itemId}`, { method: "DELETE" });
}
export function submitOrder(cartId: number): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart_id: cartId }),
  });
}
