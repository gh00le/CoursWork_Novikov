import { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../../cart/context/useCart";

function ProductCard({ product }) {
  const { addProduct } = useCart();
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    setAdding(true);
    setMessage("");
    try {
      // одна единица добавляется по умолчанию, чтобы кнопка работала без отдельного поля количества.
      await addProduct(product.id, 1);
      setMessage("Добавлено в корзину");
    } catch (error) {
      setMessage(error.message || "Не удалось добавить товар");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="product-card">
      <img
        className="product-image"
        src={product.image_url ?? "/images/products/placeholder.svg"}
        alt={product.name}
        onError={(event) => {
          event.currentTarget.src = "/images/products/placeholder.svg";
        }}
      />

      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        {/* денежная сумма отображается с двумя знаками после запятой, как цена в базе. */}
        <p className="price">{Number(product.price).toFixed(2)} ₽</p>
        <p className="muted">На складе: {product.stock}</p>

        <div className="product-actions">
          <Link
            className="button button-secondary"
            to={`/products/${product.id}`}
          >
            Подробнее
          </Link>
          <button
            className="button"
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
          >
            {adding ? "Добавление..." : "В корзину"}
          </button>
        </div>
        {message && <p className="small-message" role="status">{message}</p>}
      </div>
    </article>
  );
}

export default ProductCard;
