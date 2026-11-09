import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AddToCartButton from "../../../features/cart/AddToCartButton";
import { backendRequest } from "../../../lib/backend";
import { formatPrice } from "../../../lib/formatPrice";
import { productImage } from "../../../lib/productImage";
import type { Product } from "../../../types/shop";
export const dynamic = "force-dynamic";
type ProductParams = Promise<{ productId: string }>;
export async function generateMetadata({ params }: { params: ProductParams }): Promise<Metadata> {
  const { productId } = await params;
  try {
    const product = await backendRequest<Product>(`/api/v1/products/${productId}`);
    return { title: `${product.name} | Simple Shop MPA`, description: product.description };
  } catch {
    return { title: "Товар | Simple Shop MPA", description: "Карточка товара учебного интернет-магазина." };
  }
}
async function ProductContent({ params }: { params: ProductParams }) {
  const { productId } = await params;
  const product = await backendRequest<Product>(`/api/v1/products/${productId}`);
  return <div className="row g-4">
    <div className="col-12 col-md-5"><Image className="img-fluid rounded border" width={800} height={600}
      sizes="(max-width: 760px) 100vw, 50vw" src={productImage(product.image_url)} alt={product.name} /></div>
    <div className="col-12 col-md-7">
      <p className="text-secondary">SSR-карточка товара</p>
      <h1>{product.name}</h1><p>{product.description}</p>
      <p className="fw-semibold fs-4">{formatPrice(product.price)}</p>
      <p className="text-secondary">Остаток: {product.stock}</p>
      <AddToCartButton productId={product.id} maxQuantity={product.stock} showQuantity disabled={product.stock === 0} />
    </div>
  </div>;
}
export default function ProductPage({ params }: { params: ProductParams }) {
  return <section>
    <Link className="btn btn-link ps-0 mb-3" href="/catalog">← Назад в каталог</Link>
    <Suspense fallback={<p role="status">Загрузка товара...</p>}><ProductContent params={params} /></Suspense>
  </section>;
}
