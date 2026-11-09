import { createContext } from "react";
import type { CartContextValue } from "../../../types/shop";

export const CartContext = createContext<CartContextValue | null>(null);
