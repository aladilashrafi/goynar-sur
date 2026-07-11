import React from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import { AddCart, Cart, QuickView, Wishlist } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import { productUrl } from "@/utils/routes";
import { notifyWarning } from "@/utils/toast";
import ProductRating from "@/components/common/product-rating";
import SalePrice from "@/components/common/sale-price";

const ProductItem = ({ product }) => {
  const { _id, img, title, price, regularPrice, discount, tags, status, isVariable, averageRating, ratingCount } = product || {};
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const isAddedToCart = cart_products.some((prd) => prd._id === _id);
  const isAddedToWishlist = wishlist.some((prd) => prd._id === _id);
  const dispatch = useDispatch();

  const openQuickView = (prd) => {
    dispatch(handleProductModal(prd));
  };

  // handle add product
  const handleAddProduct = (prd) => {
    if (prd?.isVariable) {
      notifyWarning("Please choose product options before adding to cart.");
      openQuickView(prd);
      return;
    }

    dispatch(add_cart_product(prd));
  };

  // handle wishlist product
  const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  return (
    <div className="tp-product-item-4 p-relative mb-40">
      <div className="tp-product-thumb-4 p-relative fix">
        <Link href={productUrl(product)}>
          <Image
            src={img}
            alt={title || "Goynar Sur product"}
            fill
            sizes="(max-width: 575px) 92vw, (max-width: 991px) 46vw, (max-width: 1199px) 30vw, 284px"
            style={{ objectFit: "cover" }}
          />
        </Link>
        <div className="tp-product-badge">
          {discount > 0 && <span className="product-offer">Save {discount}%</span>}
          {status === 'out-of-stock' && <span className="product-hot">out-stock</span>}
        </div>
        <div className="tp-product-action-3 tp-product-action-4 has-shadow tp-product-action-blackStyle tp-product-action-brownStyle">
          <div className="tp-product-action-item-3 d-flex flex-column">
            {isVariable ? (
              <button
                type="button"
                onClick={() => handleAddProduct(product)}
                className="tp-product-action-btn-3 tp-product-add-cart-btn text-center"
                disabled={status === 'out-of-stock'}
              >
                <Cart />
                <span className="tp-product-tooltip">Add to Cart</span>
              </button>
            ) : isAddedToCart ? (
              <Link
                href="/cart"
                className={`tp-product-action-btn-3 ${isAddedToCart ? 'active' : ''} tp-product-add-cart-btn text-center`}
              >
                <Cart />
                <span className="tp-product-tooltip">View Cart</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleAddProduct(product)}
                className={`tp-product-action-btn-3 ${isAddedToCart ? 'active' : ''} tp-product-add-cart-btn`}
                disabled={status === 'out-of-stock'}
              >
                <Cart />
                <span className="tp-product-tooltip">Add to Cart</span>
              </button>
            )}
            <button
              type="button"
              className="tp-product-action-btn-3 tp-product-quick-view-btn"
              onClick={() => dispatch(handleProductModal(product))}
            >
              <QuickView />
              <span className="tp-product-tooltip">Quick View</span>
            </button>
            <button
              type="button"
              onClick={() => handleWishlistProduct(product)}
              className={`tp-product-action-btn-3 ${isAddedToWishlist ? 'active' : ''} tp-product-add-to-wishlist-btn`}
              disabled={status === 'out-of-stock'}
            >
              <Wishlist />
              <span className="tp-product-tooltip">Add To Wishlist</span>
            </button>
          </div>
        </div>
      </div>
      <div className="tp-product-content-4">
        <h3 className="tp-product-title-4">
          <Link href={productUrl(product)}>{title}</Link>
        </h3>
        <ProductRating averageRating={averageRating} ratingCount={ratingCount} className="mb-5" />
        <div className="tp-product-info-4">
          <p>{tags?.[0]}</p>
        </div>

        <div className="tp-product-price-inner-4">
          <div className="tp-product-price-wrapper-4">
            <SalePrice
              price={price}
              regularPrice={regularPrice}
              currentPriceClassName="tp-product-price-4"
              showSavings={false}
            />
          </div>
          <div className="tp-product-price-add-to-cart">
            {isVariable ? <button disabled={status === 'out-of-stock'} onClick={() => handleAddProduct(product)} className="tp-product-add-to-cart-4">
              <AddCart /> Add to Cart
            </button> : isAddedToCart ? <Link href="/cart" className="tp-product-add-to-cart-4">
              <AddCart /> View Cart
            </Link> : <button disabled={status === 'out-of-stock'} onClick={()=> handleAddProduct(product)} className="tp-product-add-to-cart-4">
              <AddCart /> Add to Cart
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
