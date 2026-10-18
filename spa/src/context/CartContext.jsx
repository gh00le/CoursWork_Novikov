import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  addCartItem,
  createCart,
  createOrder,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "../api/api";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "coursework_cart_id"; // Ключ localStorage нужен, чтобы одна корзина сохранялась после обновления страницы.

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  async function createAndLoadCart() {
    const createdCart = await createCart();
    localStorage.setItem(CART_STORAGE_KEY, String(createdCart.id));

    const loadedCart = await getCart(createdCart.id);
    setCart(loadedCart);

    return loadedCart;
  }

  useEffect(() => {
    async function loadInitialCart() {
      try {
        const savedCartId = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCartId) {
          await createAndLoadCart();
          return;
        }

        const loadedCart = await getCart(savedCartId);
        setCart(loadedCart);
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
        await createAndLoadCart();
      } finally {
        setLoading(false);
      }
    }

    loadInitialCart();
  }, []);

  async function addProduct(productId, quantity = 1) {
    if (!cart) {
      return;
    }

    const updatedCart = await addCartItem(cart.id, productId, quantity);
    setCart(updatedCart);
  }

  async function changeQuantity(itemId, quantity) {
    if (!cart) {
      return;
    }

    const updatedCart = await updateCartItem(cart.id, itemId, quantity);
    setCart(updatedCart);
  }

  async function removeItem(itemId) {
    if (!cart) {
      return;
    }

    await deleteCartItem(cart.id, itemId);
    const updatedCart = await getCart(cart.id);
    setCart(updatedCart);
  }

  async function checkout() {
    if (!cart) {
      throw new Error("Корзина ещё не создана");
    }

    const order = await createOrder(cart.id);
    localStorage.removeItem(CART_STORAGE_KEY);
    await createAndLoadCart();

    return order;
  }

  const itemsCount = useMemo(() => {
    if (!cart) {
      return 0;
    }

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const value = {
    cart,
    loading,
    itemsCount,
    addProduct,
    changeQuantity,
    removeItem,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }

  return context;
}
