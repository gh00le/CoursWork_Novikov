import { Suspense } from "react";

import AddToCartButton from "../../../components/AddToCartButton";
import { backendRequest } from "../../../lib/backend";
import { formatPrice } from "../../../lib/formatPrice";

async function ProductContent({ params }) {
  const { productId } = await params;
  const product = await backendRequest(`/api/products/${productId}`);

  return (
    <div className="product-details">
      <img
        className="product-details-image"
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
      <a className="back-link" href="/catalog">
        ← Назад в каталог
      </a>

      <Suspense fallback={<p>Загрузка товара...</p>}>
        <ProductContent params={params} />
      </Suspense>
    </section>
  );
}
