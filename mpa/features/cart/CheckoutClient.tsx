"use client";
import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "../../lib/formatPrice";
import { getOrCreateCartId, submitOrder, clearCartId } from "./api";
import type { Order } from "../../types/shop";
export default function CheckoutClient() {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function createOrder() {
    setSending(true); setMessage("");
    try {
      const cartId = await getOrCreateCartId();
      const result = await submitOrder(cartId);
      clearCartId();
      setOrder(result);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось создать заказ"); }
    finally { setSending(false); }
  }
  if (order) return <div className="card p-4">
    <h2>Заказ №{order.id} создан</h2><p>Сумма: {formatPrice(order.total_amount)}</p>
    <div><Link className="btn btn-primary" href="/catalog">Вернуться в каталог</Link></div>
  </div>;
  return <div className="card p-4 my-3">
    {message && <p className="text-danger" role="alert">{message}</p>}
    <p>После подтверждения запрос пройдёт через единый шлюз Nginx в FastAPI.</p>
    <div><button className="btn btn-primary" type="button" onClick={createOrder} disabled={sending}>
      {sending ? "Создание заказа..." : "Подтвердить заказ"}
    </button></div>
  </div>;
}
