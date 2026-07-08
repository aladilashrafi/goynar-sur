export function productUrl(product = {}) {
  const slug = product.slug || product.raw?.slug || product._id || product.id;
  return `/product/${slug}`;
}

export function categoryUrl(category = {}) {
  const slug = category.slug || category.raw?.slug || category.name || category.parent || category.id || category._id;
  return `/product-category/${slug}`;
}
