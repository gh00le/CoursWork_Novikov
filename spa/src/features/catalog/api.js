import { apiRequest } from "../../shared/api/client";

export function getCategories() {
  return apiRequest("/api/v1/categories");
}

export function getProducts({ categoryId, search } = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category_id", categoryId);
  if (search) params.set("search", search);

  const query = params.toString();
  return apiRequest(`/api/v1/products${query ? `?${query}` : ""}`);
}

export function getProduct(productId) {
  return apiRequest(`/api/v1/products/${productId}`);
}
