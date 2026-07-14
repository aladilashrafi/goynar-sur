import { useState } from "react";
import LoginForm from "../forms/login-form";

const CheckoutLogin = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="tp-checkout-verify-item">
      <button
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        className="tp-checkout-verify-reveal tp-checkout-login-form-reveal-btn gs-mobile-checkout-reveal-btn"
        aria-expanded={isOpen}
        aria-controls="tpReturnCustomerLoginForm"
      >
        <span>
          <span className="gs-mobile-checkout-reveal-kicker">Returning customer?</span>
          <strong>Login to use saved details</strong>
        </span>
        <i className={`fa-regular fa-angle-${isOpen ? "up" : "down"}`} aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div
          id="tpReturnCustomerLoginForm"
          className="tp-return-customer gs-mobile-checkout-collapsible-panel gs-mobile-checkout-login-panel"
          role="region"
          aria-label="Returning customer login"
        >
          <LoginForm redirectTo="/checkout" />
        </div>
      )}
    </div>
  );
};

export default CheckoutLogin;
