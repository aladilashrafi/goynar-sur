import { getProductById, getProductBySlug } from "@/lib/woocommerce";
import { mapWooProduct } from "@/utils/mapWooProduct";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const identifier = String(req.query.id || "");
    const product = /^\d+$/.test(identifier)
      ? await getProductById(identifier)
      : await getProductBySlug(identifier);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product: mapWooProduct(product) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
}
