import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProduct } from "../api/api";
import { useCart } from "../context/CartContext";

function ProductPage() {
  const { productId } = useParams();
  const { addProduct } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProduct(productId);
        setProduct(data);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleAddToCart() {
    await addProduct(product.id, quantity);
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!product) {
    return <p>Загрузка товара...</p>;
  }

  return (
    <section>
      <Link className="back-link" to="/catalog">
        ← Назад в каталог
      </Link>

      <div className="product-details">
        <img
          className="product-details-image"
          src={product.image_url ?? "/images/products/placeholder.svg"}
          alt={product.name}
        />

        <div>
          <p className="eyebrow">Карточка товара</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="price">{Number(product.price).toFixed(2)} ₽</p>
          <p className="muted">Остаток: {product.stock}</p>

          <div className="quantity-row">
            <label htmlFor="quantity">Количество</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          <button
            className="button"
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductPage;
