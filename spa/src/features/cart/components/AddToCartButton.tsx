import { useState } from "react";
import { useCart } from "../context/useCart";

interface Props {
  productId: number;
  stock: number;
  showQuantity?: boolean;
  label?: string;
}

// Повторно используется на карточке товара и в каталоге.
export default function AddToCartButton({ productId, stock, showQuantity = false, label = "В корзину" }: Props) {
  const { addProduct } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock) {
      setMessage("Укажите количество в пределах остатка на складе");
      return;
    }
    setAdding(true);
    setMessage("");
    try {
      await addProduct(productId, quantity);
      setMessage(showQuantity ? "Товар добавлен в корзину" : "Добавлено в корзину");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось добавить товар");
    } finally { setAdding(false); }
  }
  return (
    <div>
      {showQuantity && (
        <div className="d-flex align-items-center gap-2 my-3">
          <label htmlFor={`quantity-${productId}`}>Количество</label>
          <input className="form-control w-auto" id={`quantity-${productId}`} type="number" min="1"
            max={stock} value={quantity}
            onChange={(event) => setQuantity(event.target.value === "" ? 0 : Number(event.target.value))} />
        </div>
      )}
      <button className="btn btn-primary" type="button" onClick={handleAdd} disabled={stock === 0 || adding}>
        {adding ? "Добавление..." : label}
      </button>
      {message && <p className="small mt-2" role="status">{message}</p>}
    </div>
  );
}
