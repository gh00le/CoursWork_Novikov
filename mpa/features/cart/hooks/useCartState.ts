"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getOrCreateCartId, getCart, removeCartItem, updateCartItem } from "../api";
import type { Cart } from "../../../types/shop";

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : "Ошибка корзины";
}

// Только состояние и действия; отрисовка находится в CartClient и CartItemRow.
export function useCartState() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const initializationStarted = useRef(false);

  const loadCart = useCallback(async () => {
    try {
      const cartId = await getOrCreateCartId();
      const loaded = await getCart(cartId);
      setCart(loaded);
      setMessage("");
    } catch (error) {
      setMessage(messageFromError(error));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    void Promise.resolve().then(loadCart);
  }, [loadCart]);

  async function changeQuantity(itemId: number, quantity: number) {
    if (!cart) return;
    const updated = await updateCartItem(cart.id, itemId, quantity);
    setCart(updated);
    setMessage("");
  }
  async function removeItem(itemId: number) {
    if (!cart) return;
    await removeCartItem(cart.id, itemId);
    await loadCart();
  }
  return { cart, message, loading, changeQuantity, removeItem };
}
