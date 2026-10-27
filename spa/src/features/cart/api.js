import { apiRequest } from "../../shared/api/client";

export function createCart() {
  return apiRequest("/api/v1/cart", { method: "POST" });
}

export function getCart(cartId) {
  return apiRequest(`/api/v1/cart/${cartId}`);
}

// если количество не указано, добавляется одна единица товара.
export function addCartItem(cartId, productId, quantity = 1) {
  return apiRequest(`/api/v1/cart/${cartId}/items`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function updateCartItem(cartId, itemId, quantity) {
  return apiRequest(`/api/v1/cart/${cartId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function deleteCartItem(cartId, itemId) {
  return apiRequest(`/api/v1/cart/${cartId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export function createOrder(cartId) {
  return apiRequest("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
  });
}
