import { calcDiscountPercent } from "./formatPrice";
import { getAvailableQuantity } from "./inventory";

const FALLBACK_IMAGE = "/assets/img/logo/goynar-sur-logo.png";

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function mapImages(images = []) {
  if (!images.length) {
    return [{ img: FALLBACK_IMAGE, color: null }];
  }

  return images.map((image) => ({
    img: image?.src || FALLBACK_IMAGE,
    color: null,
  }));
}

export function mapWooProduct(product = {}) {
  const images = mapImages(product.images);
  const firstCategory = product.categories?.[0] || {};
  const secondCategory = product.categories?.[1] || {};
  const price = Number(product.price || product.sale_price || product.regular_price || 0);
  const regularPrice = Number(product.regular_price || price || 0);
  const salePrice = Number(product.sale_price || 0);
  const rating = Number(product.average_rating || 0);
  const reviewCount = Number(product.rating_count || 0);
  const totalSales = Number(product.total_sales || 0);

  return {
    _id: String(product.id),
    id: product.id,
    type: product.type || "simple",
    isVariable: product.type === "variable",
    title: product.name || "Untitled product",
    slug: product.slug || "",
    sku: product.sku || "",
    price,
    regularPrice,
    salePrice,
    totalSales,
    discount: calcDiscountPercent(regularPrice, salePrice),
    img: images[0]?.img || FALLBACK_IMAGE,
    imageURLs: images,
    category: {
      _id: String(firstCategory.id || ""),
      id: firstCategory.id || null,
      name: firstCategory.name || "Jewellery",
      slug: firstCategory.slug || "",
    },
    parent: firstCategory.name || "Jewellery",
    children: secondCategory.name || "",
    tags: product.tags?.map((tag) => tag.name).filter(Boolean) || [],
    description: product.description || "",
    shortDescription: product.short_description || "",
    plainDescription: stripHtml(product.short_description || product.description),
    quantity: getAvailableQuantity(product),
    status: product.stock_status === "instock" ? "in-stock" : "out-of-stock",
    reviews: reviewCount
      ? Array.from({ length: reviewCount }, (_, index) => ({ _id: index, rating }))
      : [],
    brand: { name: "Goynar Sur" },
    attributes: (product.attributes || []).map((attribute) => ({
      id: attribute.id || 0,
      name: attribute.name || "",
      slug: attribute.slug || attribute.name || "",
      variation: Boolean(attribute.variation),
      options: attribute.options || [],
    })),
    defaultAttributes: (product.default_attributes || []).map((attribute) => ({
      id: attribute.id || 0,
      name: attribute.name || "",
      option: attribute.option || "",
    })),
    variationIds: product.variations || [],
    createdAt: product.date_created || product.date_modified || null,
    raw: product,
  };
}

export function mapWooProducts(products = []) {
  return products.map(mapWooProduct);
}
