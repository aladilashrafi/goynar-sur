import { useSelector } from "react-redux";
// internal
import useCartInfo from "@/hooks/use-cart-info";
import ErrorMsg from "../common/error-msg";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";

const CheckoutOrderArea = ({ checkoutData }) => {
  const {
    cartTotal = 0,
    isCheckoutSubmit,
    register,
    errors,
    shippingCost,
    discountAmount,
    shippingRates,
    selectedShippingRateId,
    handleShippingRateSelect,
    shippingError,
    isShippingLoading,
    watch,
    isCheckoutReady,
  } = checkoutData;
  const { cart_products } = useSelector((state) => state.cart);
  const { total } = useCartInfo();
  return (
    <div className="tp-checkout-place white-bg gs-mobile-checkout-order">
      <h3 className="tp-checkout-place-title">Your Order</h3>

      <div className="tp-order-info-list">
        <ul>
          {/*  header */}
          <li className="tp-order-info-list-header">
            <h4>Product</h4>
            <h4>Total</h4>
          </li>

          {/*  item list */}
          {cart_products.map((item) => (
            <li key={item._id} className="tp-order-info-list-desc">
              <div className="gs-mobile-checkout-product">
                {item.img && (
                  <div className="gs-mobile-checkout-product-image">
                    <Image
                      src={item.img}
                      alt=""
                      width={56}
                      height={56}
                      sizes="56px"
                    />
                    <span aria-hidden="true">{item.orderQuantity}</span>
                  </div>
                )}
                <div>
                  <p>
                    {item.title} <span className="gs-desktop-order-quantity"> x {item.orderQuantity}</span>
                  </p>
                  {item.selectedAttributes?.length > 0 && (
                    <small>{item.selectedAttributes.map((attr) => `${attr.name}: ${attr.value}`).join(" / ")}</small>
                  )}
                </div>
              </div>
              <span>{formatPrice(item.price * item.orderQuantity)}</span>
            </li>
          ))}

          {/*  shipping */}
          <li className="tp-order-info-list-shipping">
            <span>Shipping</span>
            <div className="tp-order-info-list-shipping-item d-flex flex-column align-items-end">
              {!watch("district") && <span>Select district to calculate shipping</span>}
              {watch("district") && isShippingLoading && <span>Calculating shipping...</span>}
              {watch("district") && !isShippingLoading && shippingRates.length === 0 && (
                <span>{shippingError || "No shipping method available"}</span>
              )}
              {shippingRates.map((rate) => (
                <span key={rate.rateId}>
                  <input
                    {...register(`shippingRateId`, {
                      required: `Shipping Option is required!`,
                    })}
                    id={`shipping_${rate.rateId}`}
                    type="radio"
                    name="shippingRateId"
                    value={rate.rateId}
                    checked={selectedShippingRateId === rate.rateId}
                    onChange={() => handleShippingRateSelect(rate)}
                  />
                  <label htmlFor={`shipping_${rate.rateId}`}>
                    {rate.name} <span>{formatPrice(rate.price)}</span>
                  </label>
                </span>
              ))}
              {watch("district") && shippingRates.length > 0 && (
                <small>Final shipping is recalculated and confirmed at checkout.</small>
              )}
              <ErrorMsg msg={errors?.shippingRateId?.message} />
              {shippingError && shippingRates.length > 0 && <small className="text-danger">{shippingError}</small>}
            </div>
          </li>

           {/*  subtotal */}
           <li className="tp-order-info-list-subtotal">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </li>

           {/*  shipping cost */}
           <li className="tp-order-info-list-subtotal">
            <span>Shipping Cost</span>
            <span>{selectedShippingRateId ? formatPrice(shippingCost) : "Calculated after district and area"}</span>
          </li>

           {/* discount */}
           <li className="tp-order-info-list-subtotal">
            <span>Discount</span>
            <span>{formatPrice(discountAmount)}</span>
          </li>

          {/* total */}
          <li className="tp-order-info-list-total">
            <span>Total</span>
            <span>{formatPrice(cartTotal)}</span>
          </li>
        </ul>
      </div>
      <div className="tp-checkout-payment">
        <h4 className="gs-mobile-checkout-payment-title">Payment Method</h4>
        <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: `Payment Option is required!`,
            })}
            type="radio"
            id="cod"
            name="payment"
            value="COD"
            defaultChecked
          />
          <label htmlFor="cod">
            <strong>Cash on Delivery</strong>
            <span>Pay cash when your parcel arrives. No upfront payment is needed.</span>
          </label>
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
      </div>

      <div className="tp-checkout-btn-wrapper gs-desktop-checkout-submit">
        <button
          type="submit"
          disabled={isCheckoutSubmit || !isCheckoutReady}
          className="tp-checkout-btn w-100"
        >
          {isCheckoutSubmit ? "Placing Order..." : isCheckoutReady ? "Place Order" : "Complete delivery details"}
        </button>
      </div>

      <div className="gs-mobile-checkout-submit" role="region" aria-label="Place order">
        <div>
          <span>Order total</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </div>
        <button
          type="submit"
          disabled={isCheckoutSubmit || !isCheckoutReady}
          className="tp-checkout-btn"
        >
          {isCheckoutSubmit ? "Placing Order..." : isCheckoutReady ? "Place Order" : "Complete details"}
        </button>
        <small>Cash on Delivery · Final shipping confirmed above</small>
      </div>
    </div>
  );
};

export default CheckoutOrderArea;
