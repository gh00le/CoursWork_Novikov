"use client";

import { useEffect, useState } from "react";

import { formatPrice } from "../lib/formatPrice";

const CART_STORAGE_KEY = "coursework_cart_id"; // Идентификатор корзины хранится в браузере пользователя.

export default function CartClient() {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState("");

  async function createCart() {
    const response = await fetch("/api/cart", {
      method: "POST",
    });

    const createdCart = await response.json();
    localStorage.setItem(CART_STORAGE_KEY, String(createdCart.id));

    return createdCart.id;
  }

  async function loadCart() {
    try {
      let cartId = localStorage.getItem(CART_STORAGE_KEY);

      if (!cartId) {
        cartId = await createCart();
      }

      let response = await fetch(`/api/cart/${cartId}`);

      if (response.status === 404) {
        localStorage.removeItem(CART_STORAGE_KEY);
        cartId = await createCart();
        response = await fetch(`/api/cart/${cartId}`);
      }

      if (!response.ok) {
        throw new Error("Не удалось загрузить корзину");
      }

      setCart(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function changeQuantity(itemId, quantity) {
    if (quantity < 1) {
      return;
    }

    const response = await fetch(`/api/cart/${cart.id}/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.detail ?? "Не удалось изменить количество");
      return;
    }

    setMessage("");
    setCart(await response.json());
  }

  async function removeItem(itemId) {
    const response = await fetch(`/api/cart/${cart.id}/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Не удалось удалить товар");
      return;
    }

    await loadCart();
  }

  if (!cart) {
    return <p>{message || "Загрузка корзины..."}</p>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <p>Корзина пока пустая.</p>
        <a className="button" href="/catalog">
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <>
      {message && <p className="error">{message}</p>}

      <div className="cart-list">
        {cart.items.map((item) => (
          <article className="cart-item" key={item.id}>
            <img
              src={item.product.image_url ?? "/images/products/placeholder.svg"}
              alt={item.product.name}
            />

            <div>
              <h3>{item.product.name}</h3>
              <p>{formatPrice(item.product.price)} за штуку</p>
            </div>

            <input
              className="cart-quantity"
              type="number"
              min="1"
              value={item.quantity}
              onChange={(event) =>
                changeQuantity(item.id, Number(event.target.value))
              }
            />

            <button
              className="button button-danger"
              type="button"
              onClick={() => removeItem(item.id)}
            >
              Удалить
            </button>
          </article>
        ))}
      </div>

      <div className="cart-summary">
        <strong>Итого: {formatPrice(cart.total)}</strong>

        <a className="button" href="/checkout">
          Оформить заказ
        </a>
      </div>
    </>
  );
}
