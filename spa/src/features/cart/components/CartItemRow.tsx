import { useState } from "react";
import type { CartItem } from "../../../types/shop";
interface Props {
  item: CartItem;
  onQuantityChange(itemId: number, quantity: number): Promise<unknown>;
  onRemove(itemId: number): Promise<unknown>;
}
export default function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function saveQuantity() {
    const value = Number(quantity);
    if (!Number.isInteger(value) || value < 1) {
      setQuantity(String(item.quantity));
      setMessage("Введите целое число не меньше 1");
      return;
    }
    if (value === item.quantity) return;
    setSaving(true); setMessage("");
    try { await onQuantityChange(item.id, value); }
    catch (error) {
      setQuantity(String(item.quantity));
      setMessage(error instanceof Error ? error.message : "Не удалось изменить количество");
    } finally { setSaving(false); }
  }
  async function remove() {
    setMessage("");
    try { await onRemove(item.id); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось удалить товар"); }
  }
  return (
    <article className="card p-3 mb-3">
      <div className="row g-3 align-items-center">
        <div className="col-3 col-md-2">
          <img className="img-fluid" src={item.product.image_url ?? "/images/products/placeholder.svg"}
            alt={item.product.name} onError={(event) => { event.currentTarget.src = "/images/products/placeholder.svg"; }} />
        </div>
        <div className="col-9 col-md-6">
          <h3 className="h6">{item.product.name}</h3>
          <p>{Number(item.product.price).toFixed(2)} ₽ за штуку</p>
          {message && <p className="text-danger small" role="alert">{message}</p>}
        </div>
        <div className="col-6 col-md-2">
          <input className="form-control" aria-label={`Количество товара ${item.product.name}`}
            type="number" min="1" value={quantity} disabled={saving}
            onChange={(event) => setQuantity(event.target.value)} onBlur={saveQuantity}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
        </div>
        <div className="col-6 col-md-2">
          <button className="btn btn-outline-danger" type="button" onClick={remove}>Удалить</button>
        </div>
      </div>
    </article>
  );
}
