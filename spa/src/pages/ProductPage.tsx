import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../features/catalog/api";
import AddToCartButton from "../features/cart/components/AddToCartButton";
import type { Product } from "../types/shop";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!productId) return;
    void getProduct(productId).then((data) => { if (active) setProduct(data); })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Не удалось загрузить товар"); });
    return () => { active = false; };
  }, [productId]);
  if (error) return <p className="text-danger" role="alert">{error}</p>;
  if (!product) return <p role="status">Загрузка товара...</p>;
  return <section>
    <Link className="btn btn-link ps-0 mb-3" to="/catalog">← Назад в каталог</Link>
    <div className="row g-4">
      <div className="col-12 col-md-5">
        <img className="img-fluid rounded border" src={product.image_url ?? "/images/products/placeholder.svg"}
          alt={product.name} onError={(event) => { event.currentTarget.src = "/images/products/placeholder.svg"; }} />
      </div>
      <div className="col-12 col-md-7">
        <p className="text-secondary">Карточка товара</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="fw-semibold fs-4">{Number(product.price).toFixed(2)} ₽</p>
        <p className="text-secondary">Остаток: {product.stock}</p>
        <AddToCartButton productId={product.id} stock={product.stock} showQuantity label="Добавить в корзину" />
      </div>
    </div>
  </section>;
}
