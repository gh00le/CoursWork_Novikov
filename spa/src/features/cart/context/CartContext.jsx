import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addCartItem,
  createCart,
  createOrder,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "../api";

import { CartContext } from "./cart-context";

const CART_STORAGE_KEY = "coursework_cart_id";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initializationStarted = useRef(false);

  const createAndLoadCart = useCallback(async () => {
    const createdCart = await createCart();
    localStorage.setItem(CART_STORAGE_KEY, String(createdCart.id));

    try {
      const loadedCart = await getCart(createdCart.id);
      setCart(loadedCart);
      setError("");
      return loadedCart;
    } catch (requestError) {
      localStorage.removeItem(CART_STORAGE_KEY);
      throw requestError;
    }
  }, []);

  useEffect(() => {
    // react strictmode повторяет эффекты в режиме разработки, поэтому нельзя создавать две корзины.
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    async function loadInitialCart() {
      try {
        const savedCartId = localStorage.getItem(CART_STORAGE_KEY);
        if (!savedCartId) {
          await createAndLoadCart();
          return;
        }

        try {
          const loadedCart = await getCart(savedCartId);
          setCart(loadedCart);
        } catch (requestError) {
          if (requestError.status !== 404) throw requestError;
          localStorage.removeItem(CART_STORAGE_KEY);
          await createAndLoadCart();
        }
      } catch (requestError) {
        setError(requestError.message || "Не удалось подключиться к магазину");
      } finally {
        setLoading(false);
      }
    }

    loadInitialCart();
  }, [createAndLoadCart]);

  // одна единица — минимальное количество товара при добавлении без выбора количества.
  async function addProduct(productId, quantity = 1) {
    if (!cart) throw new Error("Корзина ещё не загружена");
    const updatedCart = await addCartItem(cart.id, productId, quantity);
    setCart(updatedCart);
    setError("");
    return updatedCart;
  }

  async function changeQuantity(itemId, quantity) {
    if (!cart) throw new Error("Корзина ещё не загружена");
    const updatedCart = await updateCartItem(cart.id, itemId, quantity);
    setCart(updatedCart);
    setError("");
    return updatedCart;
  }

  async function removeItem(itemId) {
    if (!cart) throw new Error("Корзина ещё не загружена");
    await deleteCartItem(cart.id, itemId);
    const updatedCart = await getCart(cart.id);
    setCart(updatedCart);
    setError("");
    return updatedCart;
  }

  async function checkout() {
    if (!cart) throw new Error("Корзина ещё не создана");
    if (cart.items.length === 0) throw new Error("Корзина пуста");

    const order = await createOrder(cart.id);
    localStorage.removeItem(CART_STORAGE_KEY);
    setCart(null);

    // заказ уже создан, поэтому ошибка создания новой пустой корзины не должна
    // превращать успешное оформление в сообщение об ошибке.
    try {
      await createAndLoadCart();
    } catch (requestError) {
      setError(
        `Заказ создан, но новую корзину загрузить не удалось: ${requestError.message}`,
      );
    }
    return order;
  }

  const itemsCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const value = {
    cart,
    loading,
    error,
    itemsCount,
    addProduct,
    changeQuantity,
    removeItem,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
