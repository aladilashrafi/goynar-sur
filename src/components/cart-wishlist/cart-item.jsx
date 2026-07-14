import React from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Link from "next/link";
// internal
import { Close, Minus, Plus } from "@/svg";
import { add_cart_product, quantityDecrement, remove_product } from "@/redux/features/cartSlice";
import { formatPrice } from "@/utils/formatPrice";
import { productUrl } from "@/utils/routes";

const CartItem = ({product}) => {
  const {_id, img,title,price, orderQuantity = 0, selectedAttributes = [] } = product || {};

  const dispatch = useDispatch();

    // handle add product
    const handleAddProduct = (prd) => {
      dispatch(add_cart_product(prd))
    }
    // handle decrement product
    const handleDecrement = (prd) => {
      dispatch(quantityDecrement(prd))
    }
  
    // handle remove product
    const handleRemovePrd = (prd) => {
      dispatch(remove_product(prd))
    }

  return (
    <tr className="gs-cart-product-row">
      {/* img */}
      <td className="tp-cart-img">
        <Link href={productUrl(product)}>
          <Image src={img} alt="product img" width={70} height={70} />
        </Link>
      </td>
      {/* title */}
      <td className="tp-cart-title gs-cart-product-info">
        <Link href={productUrl(product)}>{title}</Link>
        {selectedAttributes.length > 0 && (
          <p className="mb-0">
            {selectedAttributes.map((item) => `${item.name}: ${item.value}`).join(" / ")}
          </p>
        )}
      </td>
      {/* price */}
      <td className="tp-cart-price gs-cart-line-total">
        <span>{formatPrice(price * orderQuantity)}</span>
      </td>
      {/* quantity */}
      <td className="tp-cart-quantity">
        <div className="tp-product-quantity mt-10 mb-10">
          <button type="button" onClick={()=> handleDecrement(product)} className="tp-cart-minus" aria-label={`Decrease ${title} quantity`}>
            <Minus />
          </button>
          <input className="tp-cart-input" type="text" value={orderQuantity} readOnly />
          <button type="button" onClick={()=> handleAddProduct(product)} className="tp-cart-plus" aria-label={`Increase ${title} quantity`}>
            <Plus />
          </button>
        </div>
      </td>
      {/* action */}
      <td className="tp-cart-action">
        <button onClick={()=> handleRemovePrd({title,id:_id})} className="tp-cart-action-btn" aria-label={`Remove ${title} from cart`}>
          <Close />
          <span>{" "}Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
