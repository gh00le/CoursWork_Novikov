"use client";

import { useState } from "react";

const CART_STORAGE_KEY = "coursework_cart_id"; // Один ключ хранит идентификатор корзины между переходами и обновлениями страницы.

async function getOrCreateCartId() {
  const savedCartId = localStorage.getItem(CART_STORAGE_KEY);

  if (savedCartId) {
    return savedCartId;
  }

  const response = await fetch("/api/cart", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Не удалось создать корзину");
  }

  const cart = await response.json();
  localStorage.setItem(CART_STORAGE_KEY, String(cart.id));

  return cart.id;
}

export default function AddToCartButton({
  productId,
  maxQuantity = 1,
  showQuantity = false,
  disabled = false,
}) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  async function handleAdd() {
    setMessage("");

    try {
      const cartId = await getOrCreateCartId();

      const response = await fetch(`/api/cart/${cartId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? "Не удалось добавить товар");
      }

      setMessage("Товар добавлен");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div>
      {showQuantity && (
        <div className="quantity-row">
          <label htmlFor={`quantity-${productId}`}>Количество</label>
          <input
            id={`quantity-${productId}`}
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </div>
      )}

      <button
        className="button"
        type="button"
        onClick={handleAdd}
        disabled={disabled}
      >
        В корзину
      </button>

      {message && <span className="small-message">{message}</span>}
    </div>
  );
}
