import { Link } from "react-router-dom";
import { useCart } from "../features/cart/context/useCart";
import CartItemRow from "../features/cart/components/CartItemRow";

export default function CartPage() {
  const { cart, loading, error, changeQuantity, removeItem } = useCart();
  if (loading) return <p role="status">Загрузка корзины...</p>;
  if (!cart) return <p className="text-danger" role="alert">{error || "Корзина недоступна. Проверьте, запущен ли Backend."}</p>;
  return <section>
    <p className="text-secondary small">Корзина</p>
    <h1>Выбранные товары</h1>
    {error && <p className="text-danger" role="alert">{error}</p>}
    {cart.items.length === 0 ? (
      <div className="card p-3 my-4">
        <p>Корзина пока пустая.</p>
        <div><Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link></div>
      </div>
    ) : <>
      <div className="my-4">{cart.items.map((item) => <CartItemRow key={`${item.id}-${item.quantity}`} item={item}
        onQuantityChange={changeQuantity} onRemove={removeItem} />)}</div>
      <div className="card p-3 d-flex flex-row flex-wrap justify-content-between gap-3">
        <strong>Итого: {Number(cart.total).toFixed(2)} ₽</strong>
        <Link className="btn btn-primary" to="/checkout">Оформить заказ</Link>
      </div>
    </>}
  </section>;
}
