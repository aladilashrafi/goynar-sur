import { getProductAttributeTerms, getProductVariations } from "@/lib/woocommerce";

function mapVariation(variation = {}) {
  const price = Number(variation.price || variation.sale_price || variation.regular_price || 0);
  const regularPrice = Number(variation.regular_price || price || 0);
  const salePrice = Number(variation.sale_price || 0);

  return {
    id: variation.id,
    parent_id: variation.parent_id,
    sku: variation.sku || "",
    price,
    regularPrice,
    salePrice,
    purchasable: Boolean(variation.purchasable),
    stock_status: variation.stock_status || "outofstock",
    quantity: variation.stock_quantity ?? (variation.stock_status === "instock" ? 999 : 0),
    image: variation.image?.src ? { src: variation.image.src, alt: variation.image.alt || "" } : null,
    attributes: (variation.attributes || []).map((attribute) => ({
      id: attribute.id || 0,
      name: attribute.name || "",
      slug: attribute.slug || attribute.name || "",
      option: attribute.option || "",
    })),
    raw: variation,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const productId = Number(req.query.productId || req.query.id);
  if (!productId) {
    return res.status(400).json({ success: false, message: "Valid productId is required" });
  }

  try {
    const variations = await getProductVariations(productId);
    const attributeIds = new Set();

    variations.forEach((variation) => {
      (variation.attributes || []).forEach((attribute) => {
        if (attribute.id) attributeIds.add(attribute.id);
      });
    });

    const attributeTermSlugs = {};
    await Promise.all(
      Array.from(attributeIds).map(async (attributeId) => {
        const terms = await getProductAttributeTerms(attributeId);
        attributeTermSlugs[attributeId] = Object.fromEntries(
          terms.map((term) => [term.name, term.slug])
        );
      })
    );

    return res.status(200).json({
      success: true,
      variations: variations.map(mapVariation),
      attributeTermSlugs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product variations",
    });
  }
}
