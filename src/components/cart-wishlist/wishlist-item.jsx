import React from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import { Close, Minus, Plus } from "@/svg";
import {add_cart_product,quantityDecrement} from "@/redux/features/cartSlice";
import { remove_wishlist_product } from "@/redux/features/wishlist-slice";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { productUrl } from "@/utils/routes";
import { notifyWarning } from "@/utils/toast";
import SalePrice from "@/components/common/sale-price";

const WishlistItem = ({ product }) => {
  const { _id, img, title, price, regularPrice } = product || {};
  const { cart_products } = useSelector((state) => state.cart);
  const isAddToCart = cart_products.find((item) => item._id === _id);
  const dispatch = useDispatch();
  // handle add product
  const handleAddProduct = (prd) => {
    if (prd?.isVariable) {
      notifyWarning("Please choose product options before adding to cart.");
      dispatch(handleProductModal(prd));
      return;
    }

    dispatch(add_cart_product(prd));
  };
  // handle decrement product
  const handleDecrement = (prd) => {
    dispatch(quantityDecrement(prd));
  };

  // handle remove product
  const handleRemovePrd = (prd) => {
    dispatch(remove_wishlist_product(prd));
  };
  return (
    <tr>
      <td className="tp-cart-img">
        <Link href={productUrl(product)}>
          <Image src={img} alt="product img" width={70} height={70} />
        </Link>
      </td>
      <td className="tp-cart-title">
        <Link href={productUrl(product)}>{title}</Link>
      </td>
      <td className="tp-cart-price">
        <SalePrice price={price} regularPrice={regularPrice} className="gs-sale-price--stacked" />
      </td>
      <td className="tp-cart-quantity">
        <div className="tp-product-quantity mt-10 mb-10">
          <span
            onClick={() => handleDecrement(product)}
            className="tp-cart-minus"
          >
            <Minus />
          </span>
          <input
            className="tp-cart-input"
            type="text"
            value={isAddToCart ? isAddToCart?.orderQuantity : 0}
            readOnly
          />
          <span
            onClick={() => handleAddProduct(product)}
            className="tp-cart-plus"
          >
            <Plus />
          </span>
        </div>
      </td>

      <td className="tp-cart-add-to-cart">
        <button
          onClick={() => handleAddProduct(product)}
          type="button"
          className="tp-btn tp-btn-2 tp-btn-blue"
        >
          Add To Cart
        </button>
      </td>

      <td className="tp-cart-action">
        <button
          onClick={() => handleRemovePrd({ title, id: _id })}
          className="tp-cart-action-btn"
        >
          <Close />
          <span> Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default WishlistItem;
