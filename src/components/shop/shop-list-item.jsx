import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
// internal
import { Cart, CompareThree, QuickView, Wishlist } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import { add_to_compare } from "@/redux/features/compareSlice";
import { productUrl } from "@/utils/routes";
import { notifyWarning } from "@/utils/toast";
import ProductRating from "@/components/common/product-rating";
import SalePrice from "@/components/common/sale-price";

const ShopListItem = ({ product }) => {
  const {
    _id,
    img,
    category,
    title,
    averageRating = 0,
    ratingCount = 0,
    price,
    regularPrice,
    tags,
    description,
    status,
    isVariable,
  } = product || {};
  const dispatch = useDispatch()
  const variationHint = product?.attributes?.find((attribute) => attribute.variation && attribute.options?.length);
  const [actionsOpen, setActionsOpen] = useState(false);

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
    <div
      className={`tp-product-list-item d-md-flex gs-mobile-shop-list-item ${actionsOpen ? "is-actions-open" : ""}`}
      onTouchStart={() => setActionsOpen(true)}
    >
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
          <div className="gs-mobile-product-category">{category?.name || category || "Jewellery"}</div>
          <div className="tp-product-tag-2">
            {tags?.map((t, i) => <a key={i} href="#">{t}</a>)}
          </div>
          <h3 className="tp-product-title-2">
            <Link href={productUrl(product)}>{title}</Link>
          </h3>
          <ProductRating
            averageRating={averageRating}
            ratingCount={ratingCount}
            className="tp-product-rating-icon tp-product-rating-icon-2"
          />
          <SalePrice
            price={price}
            regularPrice={regularPrice}
            className="tp-product-price-wrapper-2"
            currentPriceClassName="tp-product-price-2 new-price"
            regularPriceClassName="tp-product-price-2 old-price"
          />
          <p>
            {description.substring(0, 100)}
          </p>
          {variationHint && (
            <div className="gs-mobile-product-variation-hint">
              {variationHint.name}: {variationHint.options.slice(0, 4).join(" / ")}
            </div>
          )}
          <div className="tp-product-list-add-to-cart">
            <button disabled={status === "out-of-stock"} onClick={() => handleAddProduct(product)} className="tp-product-list-add-to-cart-btn">
              {isVariable ? "Select Options" : "Add To Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListItem;
