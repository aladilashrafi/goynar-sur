import { customerHasPurchasedProduct } from "@/lib/customer-auth";
import { sendApiError } from "@/lib/api-error";
import { createProductReview, getProductReviews } from "@/lib/woocommerce";
import { setPublicCache } from "@/lib/cache-control";
import { mapWooReview, mapWooReviews } from "@/utils/mapWooReview";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function cleanRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 0;
  return Math.max(1, Math.min(5, Math.round(rating)));
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const productId = Number(req.query.productId || req.query.product);
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product id is required." });
      }

      const result = await getProductReviews(productId, {
        page: req.query.page || 1,
        per_page: req.query.per_page || 20,
      });

      setPublicCache(res, { sMaxage: 60, staleWhileRevalidate: 300 });
      return res.status(200).json({
        success: true,
        reviews: mapWooReviews(result.reviews),
        count: result.count,
        totalPages: result.totalPages,
      });
    }

    if (req.method === "POST") {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ success: false, message: "Please login to review this product." });
      }

      const productId = Number(req.body?.productId || req.body?.product_id);
      const rating = cleanRating(req.body?.rating);
      const review = String(req.body?.comment || req.body?.review || "").trim();

      if (!productId) {
        return res.status(400).json({ success: false, message: "Product id is required." });
      }

      if (!rating) {
        return res.status(400).json({ success: false, message: "Please select a rating." });
      }

      if (review.length < 5) {
        return res.status(400).json({ success: false, message: "Please write a short review." });
      }

      const { hasPurchased, user } = await customerHasPurchasedProduct(token, productId);
      if (!hasPurchased) {
        return res.status(403).json({
          success: false,
          message: "Only verified customers who purchased this product can submit a review.",
        });
      }

      const created = await createProductReview({
        product_id: productId,
        review,
        reviewer: user.name,
        reviewer_email: user.email,
        rating,
        verified: true,
      });

      return res.status(200).json({
        success: true,
        message: "Thank you. Your review has been submitted.",
        review: mapWooReview(created),
      });
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    return sendApiError(res, error, "Product reviews could not be processed right now.");
  }
}
