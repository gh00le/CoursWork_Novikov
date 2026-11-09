const CART_STORAGE_KEY = "coursework_cart_id";
export function readCartId(): number | null {
  const value = localStorage.getItem(CART_STORAGE_KEY);
  const id = Number(value);
  return value && Number.isSafeInteger(id) && id > 0 ? id : null;
}
export function saveCartId(id: number): void { localStorage.setItem(CART_STORAGE_KEY, String(id)); }
export function clearCartId(): void { localStorage.removeItem(CART_STORAGE_KEY); }
