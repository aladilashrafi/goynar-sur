import React from "react";
import { Rating } from "react-simple-star-rating";

const ProductRating = ({
  averageRating = 0,
  ratingCount = 0,
  size = 16,
  className = "",
  showScore = true,
}) => {
  const value = Number(averageRating) || 0;
  const count = Number(ratingCount) || 0;

  if (count <= 0 || value <= 0) return null;

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`.trim()}>
      <Rating
        key={`${value}-${count}`}
        allowFraction
        readonly
        size={size}
        initialValue={value}
        fillColor="#FFB21D"
        emptyColor="#D9D9D9"
        SVGstyle={{ display: "inline-block" }}
      />
      {showScore && (
        <span aria-label={`${value.toFixed(1)} out of 5 from ${count} reviews`}>
          {value.toFixed(1)} ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
};

export default ProductRating;
