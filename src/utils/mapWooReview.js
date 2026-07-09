function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapWooReview(review = {}) {
  const reviewer = review.reviewer || "Goynar Sur Customer";
  const avatar = review.reviewer_avatar_urls?.["96"] || review.reviewer_avatar_urls?.["48"] || "";

  return {
    _id: String(review.id),
    id: review.id,
    productId: review.product_id,
    rating: Number(review.rating || 0),
    comment: stripHtml(review.review || ""),
    review: review.review || "",
    createdAt: review.date_created || review.date_created_gmt || "",
    verified: Boolean(review.verified),
    status: review.status || "approved",
    userId: {
      name: reviewer,
      imageURL: avatar,
    },
    raw: review,
  };
}

export function mapWooReviews(reviews = []) {
  return reviews.map(mapWooReview);
}
