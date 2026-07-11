import { calcDiscountPercent } from "./formatPrice";
import { getAvailableQuantity } from "./inventory";

const FALLBACK_IMAGE = "/assets/img/logo/goynar-sur-logo.png";
const HANDMADE_ATTRIBUTE_LABELS = {
  material: "Material",
  size: "Size",
  color: "Color",
  occasion: "Occasion",
  "work-type": "Work Type",
  "care-instruction": "Care Instruction",
  "gift-suitability": "Gift Suitability",
  "lead-time": "Lead Time",
};
const ATTRIBUTE_ALIASES = {
  colour: "color",
  work: "work-type",
  care: "care-instruction",
  "care-instructions": "care-instruction",
  gift: "gift-suitability",
  "gift-ready": "gift-suitability",
  "processing-time": "lead-time",
  "production-time": "lead-time",
};

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

function extractPriceFromHtml(priceHtml = "", tagName = "") {
  const match = String(priceHtml).match(
    new RegExp(`<${tagName}[^>]*>[\\s\\S]*?<bdi[^>]*>\\s*([\\d,.]+)`, "i")
  );
  if (!match?.[1]) return 0;
  return Number(match[1].replace(/,/g, "")) || 0;
}

function normalizeAttributeKey(attribute = {}) {
  const source = attribute.slug || attribute.name || "";
  const normalized = String(source)
    .replace(/^pa_/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ATTRIBUTE_ALIASES[normalized] || normalized;
}

function mapAttributes(attributes = []) {
  return attributes
    .map((attribute) => {
      const key = normalizeAttributeKey(attribute);
      const options = (attribute.options || []).map(String).filter(Boolean);

      return {
        id: attribute.id || 0,
        key,
        name: HANDMADE_ATTRIBUTE_LABELS[key] || attribute.name || "Product detail",
        slug: attribute.slug || attribute.name || "",
        variation: Boolean(attribute.variation),
        options,
        value: options.join(", "),
      };
    })
    .filter((attribute) => attribute.value);
}

export function mapWooProduct(product = {}, reviewSummary = null) {
  const images = mapImages(product.images);
  const firstCategory = product.categories?.[0] || {};
  const secondCategory = product.categories?.[1] || {};
  const htmlRegularPrice = product.on_sale
    ? extractPriceFromHtml(product.price_html, "del")
    : 0;
  const htmlSalePrice = product.on_sale
    ? extractPriceFromHtml(product.price_html, "ins")
    : 0;
  const price = Number(product.price || product.sale_price || htmlSalePrice || product.regular_price || 0);
  const regularPrice = Number(product.regular_price || htmlRegularPrice || price || 0);
  const salePrice = Number(product.sale_price || htmlSalePrice || 0);
  const averageRating = Number(reviewSummary?.averageRating ?? product.average_rating ?? 0);
  const ratingCount = Number(reviewSummary?.ratingCount ?? product.rating_count ?? 0);
  const totalSales = Number(product.total_sales || 0);
  const attributes = mapAttributes(product.attributes);
  const handmadeAttributeKeys = Object.keys(HANDMADE_ATTRIBUTE_LABELS);
  const additionalInformation = [...attributes].sort((left, right) => {
    const leftIndex = handmadeAttributeKeys.indexOf(left.key);
    const rightIndex = handmadeAttributeKeys.indexOf(right.key);
    return (leftIndex < 0 ? handmadeAttributeKeys.length : leftIndex) -
      (rightIndex < 0 ? handmadeAttributeKeys.length : rightIndex);
  });
  const trustAttributes = additionalInformation.filter((attribute) =>
    handmadeAttributeKeys.includes(attribute.key)
  );

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
    averageRating,
    ratingCount,
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
    reviews: [],
    brand: { name: "Goynar Sur" },
    attributes,
    additionalInformation,
    trustAttributes,
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

export function mapWooProducts(products = [], reviewSummaries = {}) {
  return products.map((product) => mapWooProduct(product, reviewSummaries[product.id]));
}
