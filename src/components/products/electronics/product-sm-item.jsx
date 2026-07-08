import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Rating } from "react-simple-star-rating";
import { formatPrice } from "@/utils/formatPrice";
import { productUrl } from "@/utils/routes";

const ProductSmItem = ({ product }) => {
  const { img, category, title, price, reviews } = product || {};
  const [ratingVal, setRatingVal] = useState(0);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  return (
    <div className="tp-product-sm-item d-flex align-items-center">
      <div className="tp-product-thumb mr-25 fix">
        <Link href={productUrl(product)}>
          <Image
            src={img}
            alt="product img"
            width={140}
            height={140}
          />
        </Link>
      </div>
      <div className="tp-product-sm-content">
        <div className="tp-product-category">
          <a href="#">{category?.name}</a>
        </div>
        <h3 className="tp-product-title">
          <Link href={productUrl(product)}>{title}</Link>
        </h3>
        <div className="tp-product-rating d-sm-flex align-items-center">
          <div className="tp-product-rating-icon">
            <Rating allowFraction size={16} initialValue={ratingVal} readonly={true} />
          </div>
          <div className="tp-product-rating-text">
          ({reviews && reviews.length > 0 ? reviews.length : 0} Review)
          </div>
        </div>
        <div className="tp-product-price-wrapper">
          <span className="tp-product-price">{formatPrice(price)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSmItem;
