import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import RenderCartProgress from './render-cart-progress';
import empty_cart_img from '@assets/img/product/cartmini/empty-cart.png';
import { add_cart_product, closeCartMini, quantityDecrement, remove_product } from '@/redux/features/cartSlice';
import { formatPrice } from '@/utils/formatPrice';
import { productUrl } from '@/utils/routes';
import SalePrice from './sale-price';

const CartMiniSidebar = () => {
  const { cart_products, cartMiniOpen } = useSelector((state) => state.cart);
  const { total } = useCartInfo();
  const dispatch = useDispatch();

  // handle remove product
  const handleRemovePrd = (prd) => {
    dispatch(remove_product(prd))
  }

// handle close cart mini 
const handleCloseCartMini = () => {
  dispatch(closeCartMini())
}
  return (
    <>
      <div className={`cartmini__area tp-all-font-roboto ${cartMiniOpen ? 'cartmini-opened' : ''}`}>
        <div className="cartmini__wrapper d-flex justify-content-between flex-column">
          <div className="cartmini__top-wrapper">
            <div className="cartmini__top p-relative">
              <div className="cartmini__top-title">
                <h4>Shopping Cart</h4>
                <span className="gs-cartmini-count">
                  {cart_products.length} {cart_products.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="cartmini__close">
                <button onClick={() => dispatch(closeCartMini())} type="button" className="cartmini__close-btn cartmini-close-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="visually-hidden">Close cart</span>
                </button>
              </div>
            </div>
            <div className="cartmini__shipping">
              <RenderCartProgress/>
            </div>
            {cart_products.length > 0 && <div className="cartmini__widget">
              {cart_products.map((item) => (
                <div key={item._id} className="cartmini__widget-item">
                  <div className="cartmini__thumb">
                    <Link href={productUrl(item)}>
                      <Image src={item.img} width={70} height={70} alt="product img" />
                    </Link>
                  </div>
                  <div className="cartmini__content">
                    <h5 className="cartmini__title">
                      <Link href={productUrl(item)}>{item.title}</Link>
                    </h5>
                    {item.selectedAttributes?.length > 0 && (
                      <p className="mb-0">
                        {item.selectedAttributes.map((attr) => `${attr.name}: ${attr.value}`).join(" / ")}
                      </p>
                    )}
                    <div className="cartmini__price-wrapper">
                      <SalePrice
                        price={item.price}
                        regularPrice={item.regularPrice}
                        className="gs-sale-price--compact"
                        currentPriceClassName="cartmini__price"
                      />
                      <span className="cartmini__quantity"> x{item.orderQuantity}</span>
                    </div>
                    <div className="gs-cartmini-quantity" aria-label={`Quantity for ${item.title}`}>
                      <button type="button" onClick={() => dispatch(quantityDecrement(item))} aria-label={`Decrease ${item.title} quantity`}>−</button>
                      <span>{item.orderQuantity}</span>
                      <button type="button" onClick={() => dispatch(add_cart_product(item))} aria-label={`Increase ${item.title} quantity`}>+</button>
                    </div>
                  </div>
                  <a onClick={() => handleRemovePrd({ title: item.title, id: item._id })} className="cartmini__del cursor-pointer"><i className="fa-regular fa-xmark"></i></a>
                </div>
              ))}
            </div>}
            {/* if no item in cart */}
            {cart_products.length === 0 && <div className="cartmini__empty text-center">
              <Image src={empty_cart_img} alt="empty-cart-img" />
              <p>Your Cart is empty</p>
              <Link href="/shop" className="tp-btn">Go to Shop</Link>
            </div>}
          </div>
          <div className="cartmini__checkout">
            <div className="cartmini__checkout-title mb-30">
              <h4>Subtotal:</h4>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="gs-cartmini-shipping-note">Shipping calculated at checkout</p>
            <div className="cartmini__checkout-btn">
              <Link href="/checkout" onClick={handleCloseCartMini} className="tp-btn mb-10 w-100">Proceed to Checkout</Link>
              <Link href="/cart" onClick={handleCloseCartMini} className="tp-btn tp-btn-border w-100">View Full Cart</Link>
            </div>
          </div>
        </div>
      </div>
      {/* overlay start */}
      <div onClick={handleCloseCartMini} className={`body-overlay ${cartMiniOpen ? 'opened' : ''}`}></div>
      {/* overlay end */}
    </>
  );
};

export default CartMiniSidebar;
