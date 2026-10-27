export const CART_STORAGE_KEY = "coursework_cart_id";

async function request(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let message = "Не удалось выполнить операцию с корзиной";
    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      message = `HTTP ${response.status}`;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function createCart() {
  return request("/api/cart", { method: "POST" });
}

export async function getOrCreateCartId() {
  const savedId = localStorage.getItem(CART_STORAGE_KEY);
  if (savedId) {
    try {
      await getCart(savedId);
      return savedId;
    } catch (error) {
      if (error.status !== 404) throw error;
      clearCartId();
    }
  }

  const cart = await createCart();
  localStorage.setItem(CART_STORAGE_KEY, String(cart.id));
  return String(cart.id);
}

export async function getCart(cartId) {
  return request(`/api/cart/${cartId}`);
}

export async function addCartItem(cartId, productId, quantity) {
  return request(`/api/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItem(cartId, itemId, quantity) {
  return request(`/api/cart/${cartId}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(cartId, itemId) {
  return request(`/api/cart/${cartId}/items/${itemId}`, { method: "DELETE" });
}

export async function submitOrder(cartId) {
  return request("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart_id: Number(cartId) }),
  });
}

export function clearCartId() {
  localStorage.removeItem(CART_STORAGE_KEY);
}
