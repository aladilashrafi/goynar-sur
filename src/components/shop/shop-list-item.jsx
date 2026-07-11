import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { Rating } from "react-simple-star-rating";
import Link from "next/link";
// internal
import { Cart, CompareThree, QuickView, Wishlist } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import { add_to_compare } from "@/redux/features/compareSlice";
import { formatPrice } from "@/utils/formatPrice";
import { productUrl } from "@/utils/routes";
import { notifyWarning } from "@/utils/toast";

const ShopListItem = ({ product }) => {
  const { _id, img, category, title, reviews, price, regularPrice, discount, tags, description } = product || {};
  const dispatch = useDispatch()
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

  // handle add product
  const handleAddProduct = (prd) => {
    if (prd?.isVariable) {
      notifyWarning("Please choose product options before adding to cart.");
      dispatch(handleProductModal(prd));
      return;
    }

    dispatch(add_cart_product(prd));
  };
  // handle wishlist product
  const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = (prd) => {
    dispatch(add_to_compare(prd));
  };

  return (
    <div className="tp-product-list-item d-md-flex">
      <div className="tp-product-list-thumb p-relative fix">
        <Link href={productUrl(product)}>
          <Image
            src={img}
            alt={title || "Goynar Sur product"}
            width={350}
            height={350}
            sizes="(max-width: 767px) 92vw, (max-width: 1199px) 300px, 350px"
          />
        </Link>

        {/* <!-- product action --> */}
        <div className="tp-product-action-2 tp-product-action-blackStyle">
          <div className="tp-product-action-item-2 d-flex flex-column">
            <button
              type="button"
              className="tp-product-action-btn-2 tp-product-quick-view-btn"
              onClick={() => dispatch(handleProductModal(product))}
            >
              <QuickView />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Quick View
              </span>
            </button>
            <button
              type="button"
              onClick={()=> handleWishlistProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-wishlist-btn"
            >
              <Wishlist />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Wishlist
              </span>
            </button>
            <button
              type="button"
              onClick={()=> handleCompareProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
            >
              <CompareThree />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Compare
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="tp-product-list-content">
        <div className="tp-product-content-2 pt-15">
          <div className="tp-product-tag-2">
            {tags?.map((t, i) => <a key={i} href="#">{t}</a>)}
          </div>
          <h3 className="tp-product-title-2">
            <Link href={productUrl(product)}>{title}</Link>
          </h3>
          <div className="tp-product-rating-icon tp-product-rating-icon-2">
            <Rating allowFraction size={16} initialValue={ratingVal} readonly={true} />
          </div>
          <div className="tp-product-price-wrapper-2">
            {discount > 0 ? (
              <>
                <span className="tp-product-price-2 new-price">{formatPrice(price)}</span>
                <span className="tp-product-price-2 old-price">
                  {" "}{formatPrice(regularPrice || price)}
                </span>
              </>
            ) : (
              <span className="tp-product-price-2 new-price">{formatPrice(price)}</span>
            )}
          </div>
          <p>
            {description.substring(0, 100)}
          </p>
          <div className="tp-product-list-add-to-cart">
            <button onClick={() => handleAddProduct(product)} className="tp-product-list-add-to-cart-btn">
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListItem;
