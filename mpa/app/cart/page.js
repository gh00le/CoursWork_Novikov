import CartClient from "../../features/cart/CartClient";

export default function CartPage() {
  return (
    <section>
      <p className="eyebrow">Корзина</p>
      <h1>Выбранные товары</h1>

      <CartClient />
    </section>
  );
}
