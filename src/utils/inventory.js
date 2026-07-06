export function getAvailableQuantity(product) {
  if (!product) return 0;
  if (product.stock_status !== "instock") return 0;
  if (Number.isFinite(Number(product.stock_quantity))) {
    return Number(product.stock_quantity);
  }
  return 999;
}
