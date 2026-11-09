import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "../cart/AddToCartButton";
import { formatPrice } from "../../lib/formatPrice";
import { productImage } from "../../lib/productImage";
import type { Product } from "../../types/shop";
export default function ProductCard({ product }: { product: Product }) {
  return <article className="col"><div className="card h-100 shadow-sm">
    <Image className="card-img-top img-fluid p-3" width={800} height={600} sizes="(max-width: 760px) 100vw, 33vw"
      src={productImage(product.image_url)} alt={product.name} />
    <div className="card-body d-flex flex-column">
      <h3 className="h5 card-title">{product.name}</h3>
      <p className="card-text text-secondary">{product.description}</p>
      <p className="fw-semibold">{formatPrice(product.price)}</p>
      <p className="text-secondary">На складе: {product.stock}</p>
      <div className="d-flex flex-wrap gap-2 mt-auto">
        <Link className="btn btn-outline-primary" href={`/products/${product.id}`}>Подробнее</Link>
        <AddToCartButton productId={product.id} disabled={product.stock === 0} />
      </div>
    </div>
  </div></article>;
}
