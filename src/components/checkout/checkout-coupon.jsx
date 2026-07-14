import { useState } from "react";
import { useSelector } from "react-redux";

const CheckoutCoupon = ({ handleCouponCode, couponRef,couponApplyMsg }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { coupon_info } = useSelector((state) => state.coupon);
  return (
    <div className="tp-checkout-verify-item">
      <button
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        className="tp-checkout-verify-reveal tp-checkout-coupon-form-reveal-btn gs-mobile-checkout-reveal-btn"
        aria-expanded={isOpen}
        aria-controls="tpCheckoutCouponForm"
      >
        <span>
          <span className="gs-mobile-checkout-reveal-kicker">Have a coupon?</span>
          <strong>Apply a discount code</strong>
        </span>
        <i className={`fa-regular fa-angle-${isOpen ? "up" : "down"}`} aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div
          id="tpCheckoutCouponForm"
          className="tp-return-customer gs-mobile-checkout-collapsible-panel gs-mobile-checkout-coupon-panel"
          role="region"
          aria-label="Coupon code"
        >
          <form onSubmit={handleCouponCode}>
            <div className="tp-return-customer-input">
              <label htmlFor="checkoutCouponCode">Coupon code</label>
              <input
                ref={couponRef}
                id="checkoutCouponCode"
                type="text"
                autoComplete="off"
                placeholder="Enter coupon code"
                aria-describedby="checkoutCouponStatus"
              />
            </div>
            <button
              type="submit"
              className="tp-return-customer-btn tp-checkout-btn"
            >
              Apply
            </button>
          </form>
          <div id="checkoutCouponStatus" className="gs-mobile-checkout-status" aria-live="polite">
            {couponApplyMsg && <p className="is-success">{couponApplyMsg}</p>}
            {coupon_info && (
              <p>
                Applied coupon: <strong>{coupon_info.code}</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutCoupon;
