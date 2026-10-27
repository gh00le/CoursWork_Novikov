"use client";

import { useState } from "react";
import Link from "next/link";

import { formatPrice } from "../../lib/formatPrice";
import { clearCartId, getOrCreateCartId, submitOrder } from "./api";

export default function CheckoutClient() {
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function createOrder() {
    setSending(true);
    setMessage("");
    try {
      const cartId = await getOrCreateCartId();
      const createdOrder = await submitOrder(cartId);
      clearCartId();
      setOrder(createdOrder);
    } catch (error) {
      setMessage(error.message || "Не удалось создать заказ");
    } finally {
      setSending(false);
    }
  }

  if (order) {
    return (
      <div className="success-box">
        <h2>Заказ №{order.id} создан</h2>
        <p>Сумма: {formatPrice(order.total_amount)}</p>
        <Link className="button" href="/catalog">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="checkout-box">
      {message && <p className="error" role="alert">{message}</p>}
      <p>
        После подтверждения Next.js отправит запрос через серверный Route Handler
        в общий FastAPI.
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
