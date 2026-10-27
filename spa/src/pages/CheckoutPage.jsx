import { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../features/cart/context/useCart";

function CheckoutPage() {
  const { cart, loading, error: cartError, checkout } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleCheckout() {
    setSending(true);
    setError("");

    try {
      const createdOrder = await checkout();
      setOrder(createdOrder);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  if (order) {
    return (
      <section className="success-box">
        <p className="eyebrow">Готово</p>
        <h1>Заказ №{order.id} создан</h1>
        <p>Сумма заказа: {Number(order.total_amount).toFixed(2)} ₽</p>

        <Link className="button" to="/catalog">
          Вернуться в каталог
        </Link>
      </section>
    );
  }

  return (
    <section>
      <p className="eyebrow">Оформление</p>
      <h1>Подтверждение заказа</h1>

      {error && <p className="error">{error}</p>}

      {cartError && <p className="error" role="alert">{cartError}</p>}
      {loading ? (
        <p>Загрузка корзины...</p>
      ) : !cart || cart.items.length === 0 ? (
        <div className="empty-state">
          <p>В корзине нет товаров для оформления.</p>
          <Link className="button" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="checkout-box">
          <p>Количество позиций: {cart.items.length}</p>
          <p className="price">Итого: {Number(cart.total).toFixed(2)} ₽</p>

          <button
            className="button"
            type="button"
            onClick={handleCheckout}
            disabled={sending}
          >
            {sending ? "Создание заказа..." : "Подтвердить заказ"}
          </button>
        </div>
      )}
    </section>
  );
}

export default CheckoutPage;
