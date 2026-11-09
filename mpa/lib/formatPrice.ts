// Два знака после запятой соответствуют денежному формату с точностью до копейки.
export function formatPrice(value: number | string): string {
  return `${Number(value).toFixed(2)} ₽`;
}
