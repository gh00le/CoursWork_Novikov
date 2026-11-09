import { Link } from "react-router-dom";
import AddToCartButton from "../../cart/components/AddToCartButton";
import type { Product } from "../../../types/shop";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="col">
      <div className="card h-100 shadow-sm">
        <img className="card-img-top img-fluid p-3" src={product.image_url ?? "/images/products/placeholder.svg"}
          alt={product.name} onError={(event) => { event.currentTarget.src = "/images/products/placeholder.svg"; }} />
        <div className="card-body d-flex flex-column">
          <h3 className="h5 card-title">{product.name}</h3>
          <p className="card-text text-secondary">{product.description}</p>
          <p className="fw-semibold">{Number(product.price).toFixed(2)} ₽</p>
          <p className="text-secondary">На складе: {product.stock}</p>
          <div className="d-flex flex-wrap gap-2 mt-auto">
            <Link className="btn btn-outline-primary" to={`/products/${product.id}`}>Подробнее</Link>
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </article>
  );
}
