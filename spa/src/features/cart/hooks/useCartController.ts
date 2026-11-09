import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addCartItem, createCart, createOrder, deleteCartItem, getCart, updateCartItem } from "../api";
import { clearCartId, readCartId, saveCartId } from "../storage";
import type { Cart, CartContextValue } from "../../../types/shop";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}

// Этот хук управляет состоянием; API и localStorage вынесены в свои модули.
export function useCartController(): CartContextValue {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initializationStarted = useRef(false);

  const createAndLoadCart = useCallback(async (): Promise<Cart> => {
    const created = await createCart();
    saveCartId(created.id);
    try {
      const loaded = await getCart(created.id);
      setCart(loaded);
      setError("");
      return loaded;
    } catch (requestError) {
      clearCartId();
      throw requestError;
    }
  }, []);

  useEffect(() => {
    // StrictMode запускает эффект повторно в режиме разработки: не создаём вторую корзину.
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    async function initialize() {
      try {
        const savedId = readCartId();
        if (!savedId) {
          await createAndLoadCart();
        } else {
          try {
            setCart(await getCart(savedId));
          } catch (requestError) {
            if (!(requestError instanceof Error) || !("status" in requestError) || requestError.status !== 404) throw requestError;
            clearCartId();
            await createAndLoadCart();
          }
        }
      } catch (requestError) {
        setError(errorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [createAndLoadCart]);

  async function addProduct(productId: number, quantity = 1): Promise<Cart> {
    if (!cart) throw new Error("Корзина ещё не загружена");
    const result = await addCartItem(cart.id, productId, quantity);
    setCart(result);
    setError("");
    return result;
  }
  async function changeQuantity(itemId: number, quantity: number): Promise<Cart> {
    if (!cart) throw new Error("Корзина ещё не загружена");
    const result = await updateCartItem(cart.id, itemId, quantity);
    setCart(result);
    setError("");
    return result;
  }
  async function removeItem(itemId: number): Promise<Cart> {
    if (!cart) throw new Error("Корзина ещё не загружена");
    await deleteCartItem(cart.id, itemId);
    const result = await getCart(cart.id);
    setCart(result);
    setError("");
    return result;
  }
  async function checkout() {
    if (!cart?.items.length) throw new Error("Корзина пуста");
    const order = await createOrder(cart.id);
    clearCartId();
    setCart(null);
    try { await createAndLoadCart(); }
    catch (requestError) {
      setError(`Заказ создан, но новую корзину загрузить не удалось: ${errorMessage(requestError)}`);
    }
    return order;
  }

  const itemsCount = useMemo(() => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0, [cart]);
  return { cart, loading, error, itemsCount, addProduct, changeQuantity, removeItem, checkout };
}
