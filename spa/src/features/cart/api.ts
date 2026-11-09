import { apiRequest } from "../../shared/api/client";
import type { Cart, CartCreated, Order } from "../../types/shop";

export function createCart(): Promise<CartCreated> {
  return apiRequest<CartCreated>("/api/v1/cart", { method: "POST" });
}
export function getCart(cartId: number | string): Promise<Cart> {
  return apiRequest<Cart>(`/api/v1/cart/${cartId}`);
}
// Одна единица — количество по умолчанию при добавлении с карточки каталога.
export function addCartItem(cartId: number, productId: number, quantity = 1): Promise<Cart> {
  return apiRequest<Cart>(`/api/v1/cart/${cartId}/items`, {
    method: "POST", body: JSON.stringify({ product_id: productId, quantity }),
  });
}
export function updateCartItem(cartId: number, itemId: number, quantity: number): Promise<Cart> {
  return apiRequest<Cart>(`/api/v1/cart/${cartId}/items/${itemId}`, {
    method: "PATCH", body: JSON.stringify({ quantity }),
  });
}
export function deleteCartItem(cartId: number, itemId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/cart/${cartId}/items/${itemId}`, { method: "DELETE" });
}
export function createOrder(cartId: number): Promise<Order> {
  return apiRequest<Order>("/api/v1/orders", {
    method: "POST", body: JSON.stringify({ cart_id: cartId }),
  });
}
