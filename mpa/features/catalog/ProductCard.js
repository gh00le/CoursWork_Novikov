import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "../cart/AddToCartButton";
import { formatPrice } from "../../lib/formatPrice";

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      {/* размер 800 на 600 задаёт соотношение сторон 4:3 для изображений карточки */}
      <Image
        className="product-image"
        width={800}
        height={600}
        sizes="(max-width: 760px) 100vw, 33vw"
        src={product.image_url ?? "/images/products/placeholder.svg"}
        alt={product.name}
      />
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="muted">На складе: {product.stock}</p>
        <div className="product-actions">
          <Link className="button button-secondary" href={`/products/${product.id}`}>
            Подробнее
          </Link>
          <AddToCartButton productId={product.id} disabled={product.stock === 0} />
        </div>
      </div>
    </article>
  );
}
