"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { formatPrice } from "../../lib/formatPrice";
import CartItemRow from "./CartItemRow";
import {
  CART_STORAGE_KEY,
  clearCartId,
  createCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./api";

export default function CartClient() {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const initializationStarted = useRef(false);

  async function loadCart() {
    try {
      let cartId = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartId) {
        const created = await createCart();
        cartId = String(created.id);
        localStorage.setItem(CART_STORAGE_KEY, cartId);
      }

      let loadedCart;
      try {
        loadedCart = await getCart(cartId);
      } catch (error) {
        if (error.status !== 404) throw error;
        clearCartId();
        const created = await createCart();
        cartId = String(created.id);
        localStorage.setItem(CART_STORAGE_KEY, cartId);
        loadedCart = await getCart(cartId);
      }

      setCart(loadedCart);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Не удалось загрузить корзину");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    // обновление состояния откладывается до завершения эффекта
    void Promise.resolve().then(loadCart);
  }, []);

  async function changeQuantity(itemId, quantity) {
    if (!cart) return;
    const updatedCart = await updateCartItem(cart.id, itemId, quantity);
    setCart(updatedCart);
    setMessage("");
  }

  async function removeItem(itemId) {
    if (!cart) return;
    await removeCartItem(cart.id, itemId);
    await loadCart();
  }

  if (loading) return <p role="status">Загрузка корзины...</p>;
  if (!cart) return <p className="error" role="alert">{message || "Корзина недоступна"}</p>;

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        {message && <p className="error">{message}</p>}
        <p>Корзина пока пустая.</p>
        <Link className="button" href="/catalog">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <>
      {message && <p className="error" role="alert">{message}</p>}
      <div className="cart-list">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onChangeQuantity={changeQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      <div className="cart-summary">
        <strong>Итого: {formatPrice(cart.total)}</strong>
        <Link className="button" href="/checkout">Оформить заказ</Link>
      </div>
    </>
  );
}
