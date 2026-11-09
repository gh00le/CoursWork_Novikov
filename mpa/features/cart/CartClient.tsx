"use client";
import Link from "next/link";
import { formatPrice } from "../../lib/formatPrice";
import CartItemRow from "./CartItemRow";
import { useCartState } from "./hooks/useCartState";

export default function CartClient() {
  const { cart, loading, message, changeQuantity, removeItem } = useCartState();
  if (loading) return <p role="status">Загрузка корзины...</p>;
  if (!cart) return <p className="text-danger" role="alert">{message || "Корзина недоступна"}</p>;
  if (cart.items.length === 0) return <div className="card p-3 my-4">
    {message && <p className="text-danger">{message}</p>}
    <p>Корзина пока пустая.</p><div><Link className="btn btn-primary" href="/catalog">Перейти в каталог</Link></div>
  </div>;
  return <>
    {message && <p className="text-danger" role="alert">{message}</p>}
    <div className="my-4">{cart.items.map((item) =>
      <CartItemRow key={`${item.id}-${item.quantity}`} item={item} onChangeQuantity={changeQuantity} onRemove={removeItem} />)}</div>
    <div className="card p-3 d-flex flex-row justify-content-between align-items-center flex-wrap gap-3">
      <strong>Итого: {formatPrice(cart.total)}</strong>
      <Link className="btn btn-primary" href="/checkout">Оформить заказ</Link>
    </div>
  </>;
}
