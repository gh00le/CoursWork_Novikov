import type { ReactNode } from "react";
import { CartContext } from "./cart-context";
import { useCartController } from "../hooks/useCartController";

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartController();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}
