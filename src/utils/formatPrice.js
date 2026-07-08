export function formatPrice(value) {
  const amount = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return "\u09F30";
  }

  return `\u09F3${Math.round(amount).toLocaleString("en-IN")}`;
}

export function calcDiscountPercent(regularPrice, salePrice) {
  const regular = Number(regularPrice);
  const sale = Number(salePrice);

  if (!regular || !sale || sale >= regular) {
    return 0;
  }

  return Math.round(((regular - sale) / regular) * 100);
}
