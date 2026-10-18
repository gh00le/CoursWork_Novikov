const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"; // Адрес FastAPI. Значение 8000 соответствует порту backend из docker-compose.

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Ошибка при обращении к серверу";

    try {
      const errorData = await response.json();
      message = errorData.detail ?? message;
    } 
    catch {
      message = `HTTP ${response.status}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getCategories() {
  return request("/api/categories");
}

export function getProducts({ categoryId, search } = {}) {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("category_id", categoryId);
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();
  return request(`/api/products${query ? `?${query}` : ""}`);
}

export function getProduct(productId) {
  return request(`/api/products/${productId}`);
}

export function createCart() {
  return request("/api/cart", {
    method: "POST",
  });
}

export function getCart(cartId) {
  return request(`/api/cart/${cartId}`);
}

export function addCartItem(cartId, productId, quantity = 1) {
  return request(`/api/cart/${cartId}/items`, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });
}

export function updateCartItem(cartId, itemId, quantity) {
  return request(`/api/cart/${cartId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
    }),
  });
}

export function deleteCartItem(cartId, itemId) {
  return request(`/api/cart/${cartId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export function createOrder(cartId) {
  return request("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      cart_id: cartId,
    }),
  });
}
