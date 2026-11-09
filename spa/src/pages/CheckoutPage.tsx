import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../features/cart/context/useCart";
import type { Order } from "../types/shop";

export default function CheckoutPage() {
  const { cart, loading, error: cartError, checkout } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  async function handleCheckout() {
    setSending(true); setError("");
    try { setOrder(await checkout()); }
    catch (e) { setError(e instanceof Error ? e.message : "Не удалось оформить заказ"); }
    finally { setSending(false); }
  }
  if (order) return <section className="card p-4">
    <p className="text-success">Готово</p>
    <h1>Заказ №{order.id} создан</h1>
    <p>Сумма заказа: {Number(order.total_amount).toFixed(2)} ₽</p>
    <div><Link className="btn btn-primary" to="/catalog">Вернуться в каталог</Link></div>
  </section>;
  return <section>
    <p className="text-secondary">Оформление</p>
    <h1>Подтверждение заказа</h1>
    {error && <p className="text-danger" role="alert">{error}</p>}
    {cartError && <p className="text-danger" role="alert">{cartError}</p>}
    {loading ? <p>Загрузка корзины...</p> : !cart || cart.items.length === 0 ? (
      <div className="card p-3 my-4"><p>В корзине нет товаров для оформления.</p>
        <div><Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link></div></div>
    ) : <div className="card p-3 my-4">
      <p>Количество позиций: {cart.items.length}</p>
      <p className="fw-semibold">Итого: {Number(cart.total).toFixed(2)} ₽</p>
      <div><button className="btn btn-primary" type="button" onClick={handleCheckout} disabled={sending}>
        {sending ? "Создание заказа..." : "Подтвердить заказ"}
      </button></div>
    </div>}
  </section>;
}
