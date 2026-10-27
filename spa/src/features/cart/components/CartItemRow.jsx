import { useState } from "react";

function CartItemRow({ item, onQuantityChange, onRemove }) {
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
      await onQuantityChange(item.id, nextQuantity);
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
      <img
        src={item.product.image_url ?? "/images/products/placeholder.svg"}
        alt={item.product.name}
        onError={(event) => {
          event.currentTarget.src = "/images/products/placeholder.svg";
        }}
      />
      <div className="cart-item-info">
        <h3>{item.product.name}</h3>
        <p>{Number(item.product.price).toFixed(2)} ₽ за штуку</p>
        {message && <p className="small-message error-text" role="alert">{message}</p>}
      </div>
      {/* минимум 1 не позволяет оставить в корзине нулевое количество. */}
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
      <button
        className="button button-danger"
        type="button"
        onClick={remove}
      >
        Удалить
      </button>
    </article>
  );
}

export default CartItemRow;
