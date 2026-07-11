import { getProducts } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";
import { mapWooProducts } from "@/utils/mapWooProduct";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const search = String(req.query.search || req.query.q || "").trim();
    const category = Number(req.query.category || 0);

    if (search.length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const result = await getProducts({
      search,
      ...(category > 0 ? { category } : {}),
      status: "publish",
      per_page: 6,
    });

    const suggestions = mapWooProducts(result.products).map((product) => ({
      _id: product._id,
      id: product.id,
      slug: product.slug,
      title: product.title,
      parent: product.parent,
      category: product.category,
      img: product.img,
      price: product.price,
      regularPrice: product.regularPrice,
      discount: product.discount,
    }));

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    return sendApiError(res, error, "Search suggestions are unavailable right now.");
  }
}
