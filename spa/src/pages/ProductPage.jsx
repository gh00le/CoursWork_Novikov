import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProduct } from "../features/catalog/api";
import { useCart } from "../features/cart/context/useCart";

function ProductPage() {
  const { productId } = useParams();
  const { addProduct } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

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
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      setMessage("Укажите корректное количество с учётом остатка на складе");
      return;
    }
    setAdding(true);
    setMessage("");
    try {
      await addProduct(product.id, quantity);
      setMessage("Товар добавлен в корзину");
    } catch (requestError) {
      setMessage(requestError.message || "Не удалось добавить товар");
    } finally {
      setAdding(false);
    }
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
          onError={(event) => {
            event.currentTarget.src = "/images/products/placeholder.svg";
          }}
        />

        <div>
          <p className="eyebrow">Карточка товара</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="price">{Number(product.price).toFixed(2)} ₽</p>
          <p className="muted">Остаток: {product.stock}</p>

          <div className="quantity-row">
            <label htmlFor="quantity">Количество</label>
            {/* минимум 1 не позволяет отправить нулевое количество товара. */}
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value === "" ? 0 : Number(event.target.value))}
            />
          </div>

          <button
            className="button"
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
          >
            {adding ? "Добавление..." : "Добавить в корзину"}
          </button>
          {message && <p className="small-message" role="status">{message}</p>}
        </div>
      </div>
    </section>
  );
}

export default ProductPage;
