import { wcFetch } from "@/lib/woocommerce";

const FALLBACK_IMAGE = "/assets/img/logo/goynar-sur-logo.png";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { data } = await wcFetch("/products/categories", {
      params: {
        per_page: req.query.per_page || 100,
        hide_empty: req.query.hide_empty ?? true,
      },
    });

    const categories = data.map((category) => ({
      _id: String(category.id),
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent: category.name,
      children: [],
      count: category.count || 0,
      img: category.image?.src || FALLBACK_IMAGE,
      products: Array.from({ length: category.count || 0 }),
    }));

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
}
