import { apiRequest } from "../../shared/api/client";
import type { Category, Product } from "../../types/shop";

export function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/api/v1/categories");
}

export function getProducts({ categoryId, search }: { categoryId?: string; search?: string } = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (categoryId) params.set("category_id", categoryId);
  if (search) params.set("search", search);
  const query = params.toString();
  return apiRequest<Product[]>(`/api/v1/products${query ? `?${query}` : ""}`);
}

export function getProduct(productId: number | string): Promise<Product> {
  return apiRequest<Product>(`/api/v1/products/${productId}`);
}
