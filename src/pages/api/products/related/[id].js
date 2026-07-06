import { getProductById, getProducts, getProductsByIds } from "@/lib/woocommerce";
import { mapWooProducts } from "@/utils/mapWooProduct";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const currentProduct = await getProductById(req.query.id);
    let related = [];

    if (currentProduct.related_ids?.length) {
      related = await getProductsByIds(currentProduct.related_ids.slice(0, 8));
    }

    if (!related.length && currentProduct.categories?.[0]?.id) {
      const result = await getProducts({
        category: currentProduct.categories[0].id,
        exclude: currentProduct.id,
        per_page: 8,
        status: "publish",
      });
      related = result.products;
    }

    return res.status(200).json({
      success: true,
      products: mapWooProducts(related).filter((item) => item.id !== Number(req.query.id)),
      count: related.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch related products",
    });
  }
}
