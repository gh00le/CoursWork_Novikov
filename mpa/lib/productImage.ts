// Изображения из Next.js public должны включать basePath /mpa.
export function productImage(imageUrl: string | null): string {
  const url = imageUrl || "/images/products/placeholder.svg";
  return url.startsWith("/images/") ? `/mpa${url}` : url;
}
