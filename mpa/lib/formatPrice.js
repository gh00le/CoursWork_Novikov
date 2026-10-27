// две цифры после запятой соответствуют денежному формату с точностью до копейки
export function formatPrice(value) {
  return `${Number(value).toFixed(2)} ₽`;
}
