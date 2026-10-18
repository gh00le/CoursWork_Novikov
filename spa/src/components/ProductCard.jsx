import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addProduct } = useCart();

  async function handleAddToCart() {
    await addProduct(product.id, 1);
  }

  return (
    <article className="product-card">
      <img
        className="product-image"
        src={product.image_url ?? "/images/products/placeholder.svg"}
        alt={product.name}
      />

      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <p className="price">{Number(product.price).toFixed(2)} ₽</p>
        <p className="muted">На складе: {product.stock}</p>

        <div className="product-actions">
          <Link className="button button-secondary" to={`/products/${product.id}`}>
            Подробнее
          </Link>

          <button
            className="button"
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
