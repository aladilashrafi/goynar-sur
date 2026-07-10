import { getProducts } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";
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
  "status",
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const params = { status: "publish", per_page: 20 };

    ALLOWED_PARAMS.forEach((key) => {
      if (req.query[key] !== undefined) {
        params[key] = req.query[key];
      }
    });

    const result = await getProducts(params);

    return res.status(200).json({
      success: true,
      products: mapWooProducts(result.products),
      count: result.count,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return sendApiError(res, error, "Products are unavailable right now. Please try again soon.");
  }
}
