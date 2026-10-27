import { Link } from "react-router-dom";

import { useCart } from "../features/cart/context/useCart";
import CartItemRow from "../features/cart/components/CartItemRow";

function CartPage() {
  const { cart, loading, error, changeQuantity, removeItem } = useCart();

  if (loading) return <p>Загрузка корзины...</p>;
  if (!cart) return <p className="error">{error || "Корзина недоступна. Проверьте, запущен ли Backend."}</p>;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Корзина</p>
          <h1>Выбранные товары</h1>
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {cart.items.length === 0 ? (
        <div className="empty-state">
          <p>Корзина пока пустая.</p>
          <Link className="button" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onQuantityChange={changeQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="cart-summary">
            <strong>Итого: {Number(cart.total).toFixed(2)} ₽</strong>

            <Link className="button" to="/checkout">
              Оформить заказ
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default CartPage;
