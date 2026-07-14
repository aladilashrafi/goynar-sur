import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import { Rating } from "react-simple-star-rating";

const ReviewItem = ({ review }) => {
  const { comment, createdAt, rating, userId, verified } = review || {};
  const reviewerName = userId?.name || "Goynar Sur Customer";
  const reviewerInitial = reviewerName.charAt(0) || "G";
  return (
    <div className="tp-product-details-review-avater d-flex align-items-start">
      <div className="tp-product-details-review-avater-thumb">
        {!userId?.imageURL && <h5 className="review-name">{reviewerInitial}</h5>}
        {userId?.imageURL && <Image src={userId?.imageURL} alt={`${reviewerName} avatar`} width={60} height={60} />}
      </div>
      <div className="tp-product-details-review-avater-content">
        <div className="tp-product-details-review-avater-rating d-flex align-items-center">
          <Rating allowFraction size={16} initialValue={rating} readonly={true} />
        </div>
        <div className="gs-mobile-review-author-row">
          <h3 className="tp-product-details-review-avater-title">{reviewerName}</h3>
          {verified && <span className="gs-mobile-review-verified">Verified purchase</span>}
        </div>
        <span className="tp-product-details-review-avater-meta">
          {dayjs(createdAt).format("MMMM D, YYYY")}
        </span>

        <div className="tp-product-details-review-avater-comment">
          <p>
            {comment}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
