"use client";

import { useState } from "react";
import Image from "next/image";

import { formatPrice } from "../../lib/formatPrice";

export default function CartItemRow({ item, onChangeQuantity, onRemove }) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveQuantity() {
    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      setQuantity(String(item.quantity));
      setMessage("Введите целое число не меньше 1");
      return;
    }
    if (nextQuantity === item.quantity) return;

    setSaving(true);
    setMessage("");
    try {
      await onChangeQuantity(item.id, nextQuantity);
    } catch (error) {
      setQuantity(String(item.quantity));
      setMessage(error.message || "Не удалось изменить количество");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setMessage("");
    try {
      await onRemove(item.id);
    } catch (error) {
      setMessage(error.message || "Не удалось удалить товар");
    }
  }

  return (
    <article className="cart-item">
      {/* размер 800 на 600 задаёт соотношение сторон 4:3 и помогает next/image зарезервировать место */}
      <Image
        width={800}
        height={600}
        sizes="90px"
        src={item.product.image_url ?? "/images/products/placeholder.svg"}
        alt={item.product.name}
      />
      <div>
        <h3>{item.product.name}</h3>
        <p>{formatPrice(item.product.price)} за штуку</p>
        {message && <p className="small-message error" role="alert">{message}</p>}
      </div>
      <input
        className="cart-quantity"
        aria-label={`Количество товара ${item.product.name}`}
        type="number"
        min="1"
        value={quantity}
        disabled={saving}
        onChange={(event) => setQuantity(event.target.value)}
        onBlur={saveQuantity}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <button className="button button-danger" type="button" onClick={remove}>
        Удалить
      </button>
    </article>
  );
}
