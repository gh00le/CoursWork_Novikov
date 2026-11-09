"use client";
import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "../../lib/formatPrice";
import { productImage } from "../../lib/productImage";
import type { CartItem } from "../../types/shop";
interface Props {
  item: CartItem;
  onChangeQuantity(itemId: number, quantity: number): Promise<void>;
  onRemove(itemId: number): Promise<void>;
}
export default function CartItemRow({ item, onChangeQuantity, onRemove }: Props) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function saveQuantity() {
    const value = Number(quantity);
    if (!Number.isInteger(value) || value < 1) {
      setQuantity(String(item.quantity)); setMessage("Введите целое число не меньше 1");return;
    }
    if (value === item.quantity) return;
    setSaving(true); setMessage("");
    try { await onChangeQuantity(item.id, value); }
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
  return <article className="card p-3 mb-3">
    <div className="row g-3 align-items-center">
      <div className="col-3 col-md-2"><Image className="img-fluid" width={800} height={600} sizes="90px"
        src={productImage(item.product.image_url)} alt={item.product.name} /></div>
      <div className="col-9 col-md-6"><h3 className="h6">{item.product.name}</h3>
        <p>{formatPrice(item.product.price)} за штуку</p>
        {message && <p className="text-danger small" role="alert">{message}</p>}</div>
      <div className="col-6 col-md-2"><input className="form-control" aria-label={`Количество товара ${item.product.name}`}
        type="number" min="1" value={quantity} disabled={saving} onChange={(event) => setQuantity(event.target.value)}
        onBlur={saveQuantity} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></div>
      <div className="col-6 col-md-2"><button className="btn btn-outline-danger" type="button" onClick={remove}>Удалить</button></div>
    </div>
  </article>;
}
