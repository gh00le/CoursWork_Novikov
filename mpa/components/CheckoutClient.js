"use client";

import { useState } from "react";

import { formatPrice } from "../lib/formatPrice";

const CART_STORAGE_KEY = "coursework_cart_id"; // Тот же ключ используется на странице корзины и в кнопке добавления товара.

export default function CheckoutClient() {
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function createOrder() {
    const cartId = localStorage.getItem(CART_STORAGE_KEY);

    if (!cartId) {
      setMessage("Сначала добавьте товары в корзину");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_id: Number(cartId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Не удалось создать заказ");
      }

      localStorage.removeItem(CART_STORAGE_KEY);
      setOrder(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  if (order) {
    return (
      <div className="success-box">
        <h2>Заказ №{order.id} создан</h2>
        <p>Сумма: {formatPrice(order.total_amount)}</p>

        <a className="button" href="/catalog">
          Вернуться в каталог
        </a>
      </div>
    );
  }

  return (
    <div className="checkout-box">
      {message && <p className="error">{message}</p>}

      <p>
        После подтверждения Next.js отправит запрос через свой серверный Route
        Handler в общий FastAPI.
      </p>

      <button
        className="button"
        type="button"
        onClick={createOrder}
        disabled={sending}
      >
        {sending ? "Создание заказа..." : "Подтвердить заказ"}
      </button>
    </div>
  );
}
