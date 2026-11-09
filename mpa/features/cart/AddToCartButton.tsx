"use client";
import { useState } from "react";
import { addCartItem, getOrCreateCartId } from "./api";
interface Props { productId: number; maxQuantity?: number; showQuantity?: boolean; disabled?: boolean; }
export default function AddToCartButton({ productId, maxQuantity = 1, showQuantity = false, disabled = false }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  async function handleAdd() {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) {
      setMessage("Укажите количество в пределах остатка на складе"); return;
    }
    setAdding(true); setMessage("");
    try {
      const cartId = await getOrCreateCartId();
      await addCartItem(cartId, productId, quantity);
      setMessage("Товар добавлен в корзину");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось добавить товар"); }
    finally { setAdding(false); }
  }
  return <div>
    {showQuantity && <div className="d-flex align-items-center gap-2 my-3">
      <label htmlFor={`quantity-${productId}`}>Количество</label>
      <input className="form-control w-auto" id={`quantity-${productId}`} type="number" min="1" max={maxQuantity} value={quantity}
        onChange={(event) => setQuantity(event.target.value === "" ? 0 : Number(event.target.value))} />
    </div>}
    <button className="btn btn-primary" type="button" onClick={handleAdd} disabled={disabled || adding}>
      {adding ? "Добавление..." : "В корзину"}
    </button>
    {message && <p className="small mt-2" role="status">{message}</p>}
  </div>;
}
