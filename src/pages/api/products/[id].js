import { getProductById, getProductBySlug } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";
import { setPublicCache } from "@/lib/cache-control";
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

    setPublicCache(res, { sMaxage: 300, staleWhileRevalidate: 600 });
    return res.status(200).json({ success: true, product: mapWooProduct(product) });
  } catch (error) {
    return sendApiError(
      res,
      error,
      Number(error?.status) === 404 ? "Product not found." : "This product is unavailable right now."
    );
  }
}
