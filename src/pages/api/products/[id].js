import { getProductById } from "@/lib/woocommerce";
import { mapWooProduct } from "@/utils/mapWooProduct";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const product = await getProductById(req.query.id);
    return res.status(200).json({ success: true, product: mapWooProduct(product) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
}
