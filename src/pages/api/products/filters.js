import { getCategories } from "@/lib/woocommerce";
import { getProductAttributes, getProductAttributeTerms } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";
import { setPublicCache } from "@/lib/cache-control";

function normalizeKey(value = "") {
  return String(value)
    .replace(/^pa_/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeColor(value = "") {
  const key = normalizeKey(value);
  const palette = {
    black: "#1a1a1a",
    blue: "#2f63b7",
    brown: "#7a4a2a",
    gold: "#b8902a",
    golden: "#b8902a",
    green: "#2e7d32",
    maroon: "#6b1c3a",
    pink: "#d86d9d",
    purple: "#7a4ca0",
    red: "#b42318",
    silver: "#c4c9cf",
    white: "#ffffff",
    yellow: "#e8c45a",
  };

  return palette[key] || null;
}

function classifyAttribute(attribute = {}) {
  const key = normalizeKey(attribute.slug || attribute.name);
  if (key.includes("color") || key.includes("colour")) return "color";
  if (key.includes("size")) return "size";
  return "checkbox";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const [categories, attributes] = await Promise.all([
      getCategories({ per_page: 100, hide_empty: true }),
      getProductAttributes(),
    ]);

    const attributeOptions = await Promise.all(
      (attributes || []).map(async (attribute) => {
        const terms = await getProductAttributeTerms(attribute.id);
        return {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
          taxonomy: attribute.slug?.startsWith("pa_") ? attribute.slug : `pa_${attribute.slug}`,
          type: classifyAttribute(attribute),
          options: (terms || []).map((term) => ({
            id: term.id,
            name: term.name,
            slug: term.slug,
            count: term.count || 0,
            color: normalizeColor(term.slug || term.name),
          })),
        };
      })
    );

    setPublicCache(res, { sMaxage: 300, staleWhileRevalidate: 900 });
    return res.status(200).json({
      success: true,
      filters: {
        categories: (categories || []).map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category.count || 0,
        })),
        attributes: attributeOptions.filter((attribute) => attribute.options.length > 0),
        statuses: [
          { label: "On sale", key: "status", value: "on-sale" },
          { label: "In Stock", key: "status", value: "in-stock" },
          { label: "Featured", key: "featured", value: "true" },
        ],
      },
    });
  } catch (error) {
    return sendApiError(res, error, "Filter options are unavailable right now. Please try again soon.");
  }
}
