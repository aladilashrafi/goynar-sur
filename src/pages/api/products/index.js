import { getProductAttributes, getProductAttributeTerms, getProductReviewSummaries, getProducts } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";
import { setPublicCache } from "@/lib/cache-control";
import { mapWooProducts } from "@/utils/mapWooProduct";

const ALLOWED_PARAMS = [
  "page",
  "per_page",
  "search",
  "category",
  "featured",
  "orderby",
  "order",
  "on_sale",
  "min_price",
  "max_price",
  "stock_status",
  "attribute",
  "attribute_term",
  "attribute_relation",
  "status",
];

function splitQueryValue(value) {
  if (Array.isArray(value)) return value.flatMap(splitQueryValue);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeAttributeValue(value = "") {
  return String(value)
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .match(/[\p{L}\p{N}]+/gu)
    ?.join("") || "";
}

function getAttributeFilters(query = {}) {
  return Object.entries(query)
    .filter(([key, value]) => key.startsWith("attr_pa_") && value)
    .map(([key, value]) => ({
      taxonomy: key.replace(/^attr_/, ""),
      termIds: splitQueryValue(value),
    }))
    .filter((filter) => filter.termIds.length);
}

async function resolveAttributeFilters(attributeFilters = []) {
  if (!attributeFilters.length) return [];

  const attributes = await getProductAttributes();
  const byTaxonomy = new Map(
    (attributes || []).map((attribute) => [
      attribute.slug?.startsWith("pa_") ? attribute.slug : `pa_${attribute.slug}`,
      attribute,
    ])
  );

  return Promise.all(
    attributeFilters.map(async (filter) => {
      const attribute = byTaxonomy.get(filter.taxonomy);
      if (!attribute?.id) return { ...filter, terms: [] };

      const terms = await getProductAttributeTerms(attribute.id);
      const selectedIds = new Set(filter.termIds.map(String));

      return {
        ...filter,
        terms: (terms || [])
          .filter((term) => selectedIds.has(String(term.id)))
          .map((term) => ({
            id: String(term.id),
            name: term.name,
            slug: term.slug,
            normalizedValues: [
              normalizeAttributeValue(term.name),
              normalizeAttributeValue(term.slug),
              normalizeAttributeValue(decodeURIComponent(term.slug || "")),
            ].filter(Boolean),
          })),
      };
    })
  );
}

function productMatchesAttributeFilters(product = {}, filters = []) {
  if (!filters.length) return true;

  return filters.every((filter) => {
    if (!filter.terms.length) return true;

    const attribute = (product.attributes || []).find((item) => {
      const taxonomy = item.slug || (item.key ? `pa_${item.key}` : "");
      return taxonomy === filter.taxonomy;
    });
    if (!attribute?.options?.length) return false;

    const productOptions = attribute.options.map(normalizeAttributeValue).filter(Boolean);

    return filter.terms.some((term) =>
      term.normalizedValues.some((value) => productOptions.includes(value))
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const params = { status: "publish", per_page: 20 };
    const attributeFilters = getAttributeFilters(req.query);

    ALLOWED_PARAMS.forEach((key) => {
      if (req.query[key] !== undefined) {
        params[key] = req.query[key];
      }
    });

    const [result, reviewSummaries, resolvedAttributeFilters] = await Promise.all([
      getProducts(params),
      getProductReviewSummaries(),
      resolveAttributeFilters(attributeFilters),
    ]);
    let products = mapWooProducts(result.products, reviewSummaries);

    if (resolvedAttributeFilters.length) {
      products = products.filter((product) =>
        productMatchesAttributeFilters(product, resolvedAttributeFilters)
      );
    }

    if (params.orderby === "rating") {
      products.sort(
        (left, right) =>
          right.averageRating - left.averageRating ||
          right.ratingCount - left.ratingCount
      );
    }

    setPublicCache(res, { sMaxage: 60, staleWhileRevalidate: 300 });
    return res.status(200).json({
      success: true,
      products,
      count: resolvedAttributeFilters.length ? products.length : result.count,
      totalPages: resolvedAttributeFilters.length ? 1 : result.totalPages,
    });
  } catch (error) {
    return sendApiError(res, error, "Products are unavailable right now. Please try again soon.");
  }
}
