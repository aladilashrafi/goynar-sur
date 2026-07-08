import { getProducts } from "@/lib/woocommerce";
import { mapWooProducts } from "@/utils/mapWooProduct";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const search = String(req.query.search || req.query.q || "").trim();

    if (search.length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const result = await getProducts({
      search,
      status: "publish",
      per_page: 6,
      orderby: "relevance",
    });

    return res.status(200).json({
      success: true,
      suggestions: mapWooProducts(result.products),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Search suggestions could not be loaded.",
    });
  }
}
