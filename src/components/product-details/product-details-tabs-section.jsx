import DetailsTabNav from "./details-tab-nav";
import { useGetProductReviewsQuery } from "@/redux/features/reviewApi";

const ProductDetailsTabsSection = ({ product }) => {
  const reviewProductId = product?.id || product?._id;
  const { data: reviewData } = useGetProductReviewsQuery(reviewProductId, {
    skip: !reviewProductId,
  });
  const productWithReviews = {
    ...product,
    reviews: reviewData?.reviews || product?.reviews || [],
  };

  return <DetailsTabNav product={productWithReviews} />;
};

export default ProductDetailsTabsSection;
