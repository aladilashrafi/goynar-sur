import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
// internal
import CheckoutBillingArea from "./checkout-billing-area";
import CheckoutOrderArea from "./checkout-order-area";
import CheckoutLogin from "./checkout-login";
import CheckoutCoupon from "./checkout-coupon";
import useCheckoutSubmit from "@/hooks/use-checkout-submit";

const CheckoutArea = () => {
  const checkoutData = useCheckoutSubmit();
  const {handleSubmit,submitHandler,register,errors,watch} = checkoutData;
  const { cart_products } = useSelector((state) => state.cart);
  const { accessToken } = useSelector((state) => state.auth);
  return (
    <>
      <section
        className="tp-checkout-area pb-120 gs-mobile-checkout"
        style={{ backgroundColor: "#EFF1F5" }}
      >
        <div className="gs-mobile-checkout-trust" role="note">
          <i className="fa-regular fa-shield-check" aria-hidden="true"></i>
          <span>Secure checkout · Your order details are protected</span>
        </div>
        <div className="container">
          {cart_products.length === 0 && (
            <div className="text-center pt-50">
              <h3 className="py-2">No items found in cart to checkout</h3>
              <Link href="/shop" className="tp-checkout-btn">
                Return to shop
              </Link>
            </div>
          )}
          {cart_products.length > 0 && (
            <div className="gs-mobile-checkout-shell">
              {!accessToken && (
                <div className="row">
                  <div className="col-12">
                    <CheckoutLogin />
                  </div>
                </div>
              )}
              <div className="row">
                <div className="col-12">
                  <CheckoutCoupon
                    handleCouponCode={checkoutData.handleCouponCode}
                    couponRef={checkoutData.couponRef}
                    couponApplyMsg={checkoutData.couponApplyMsg}
                  />
                </div>
              </div>
              <form onSubmit={handleSubmit(submitHandler)} noValidate>
                <div className="row">
                  <div className="col-lg-7">
                    <CheckoutBillingArea register={register} errors={errors} watch={watch} />
                  </div>
                  <div className="col-lg-5">
                    <CheckoutOrderArea checkoutData={checkoutData} />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckoutArea;
