"use client";

import { useState } from "react";

import { addCartItem, getOrCreateCartId } from "./api";

export default function AddToCartButton({
  productId,
  maxQuantity = 1,
  showQuantity = false,
  disabled = false,
}) {
  // одна единица выбрана как безопасное начальное количество товара
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) {
      setMessage("Укажите количество в пределах остатка на складе");
      return;
    }

    setAdding(true);
    setMessage("");
    try {
      const cartId = await getOrCreateCartId();
      await addCartItem(cartId, productId, quantity);
      setMessage("Товар добавлен в корзину");
    } catch (error) {
      setMessage(error.message || "Не удалось добавить товар");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      {showQuantity && (
        <div className="quantity-row">
          <label htmlFor={`quantity-${productId}`}>Количество</label>
          {/* минимум 1 не позволяет отправить нулевое количество товара. */}
          <input
            id={`quantity-${productId}`}
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value === "" ? 0 : Number(event.target.value))
            }
          />
        </div>
      )}
      <button
        className="button"
        type="button"
        onClick={handleAdd}
        disabled={disabled || adding}
      >
        {adding ? "Добавление..." : "В корзину"}
      </button>
      {message && <span className="small-message" role="status">{message}</span>}
    </div>
  );
}
