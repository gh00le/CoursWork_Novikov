import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

function CartPage() {
  const { cart, loading, changeQuantity, removeItem } = useCart();

  if (loading || !cart) {
    return <p>Загрузка корзины...</p>;
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Корзина</p>
          <h1>Выбранные товары</h1>
        </div>
      </div>

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
              <article className="cart-item" key={item.id}>
                <img
                  src={item.product.image_url ?? "/images/products/placeholder.svg"}
                  alt={item.product.name}
                />

                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>{Number(item.product.price).toFixed(2)} ₽ за штуку</p>
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
