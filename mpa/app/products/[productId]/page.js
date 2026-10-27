import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "../../../features/cart/AddToCartButton";
import { backendRequest } from "../../../lib/backend";
import { formatPrice } from "../../../lib/formatPrice";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { productId } = await params;
  try {
    const product = await backendRequest(`/api/v1/products/${productId}`);
    return {
      title: `${product.name} | Simple Shop MPA`,
      description: product.description,
    };
  } catch {
    return {
      title: "Товар | Simple Shop MPA",
      description: "Карточка товара учебного интернет-магазина.",
    };
  }
}

async function ProductContent({ params }) {
  const { productId } = await params;
  const product = await backendRequest(`/api/v1/products/${productId}`);

  return (
    <div className="product-details">
      {/* размер 800 на 600 задаёт соотношение сторон 4:3 и резервирует место до загрузки изображения. */}
      <Image
        className="product-details-image"
        width={800}
        height={600}
        sizes="(max-width: 760px) 100vw, 50vw"
        src={product.image_url ?? "/images/products/placeholder.svg"}
        alt={product.name}
      />
      <div>
        <p className="eyebrow">SSR-карточка товара</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="muted">Остаток: {product.stock}</p>
        <AddToCartButton
          productId={product.id}
          maxQuantity={product.stock}
          showQuantity
          disabled={product.stock === 0}
        />
      </div>
    </div>
  );
}

export default function ProductPage({ params }) {
  return (
    <section>
      <Link className="back-link" href="/catalog">← Назад в каталог</Link>
      <Suspense fallback={<p role="status">Загрузка товара...</p>}>
        <ProductContent params={params} />
      </Suspense>
    </section>
  );
}
