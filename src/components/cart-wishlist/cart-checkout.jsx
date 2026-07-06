import React from "react";
import Link from "next/link";
import useCartInfo from "@/hooks/use-cart-info";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatPrice } from "@/utils/formatPrice";
import { BD_DISTRICTS } from "@/lib/bd-regions";

const CartCheckout = () => {
  const {total} = useCartInfo();
  const { cart_products } = useSelector((state) => state.cart);
  const [shipCost,setShipCost] = useState(0);
  const [district, setDistrict] = useState("");
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRateId, setSelectedRateId] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  useEffect(() => {
    if (!district || cart_products.length === 0) {
      setShippingRates([]);
      setSelectedRateId("");
      setShipCost(0);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsShippingLoading(true);
      setShippingError("");

      try {
        const response = await fetch("/api/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: cart_products, district }),
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to calculate shipping.");
        }

        const rates = data.rates || [];
        const selected = data.selectedRate || rates[0];
        setShippingRates(rates);
        setSelectedRateId(selected?.rateId || "");
        setShipCost(Number(selected?.price || 0));

        if (!rates.length) {
          setShippingError("No shipping method is available for this district.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setShippingRates([]);
          setSelectedRateId("");
          setShipCost(0);
          setShippingError(error.message || "Unable to calculate shipping.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsShippingLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [cart_products, district]);

  const handleShippingRateSelect = (rate) => {
    setSelectedRateId(rate.rateId);
    setShipCost(Number(rate.price || 0));
  };

  return (
    <div className="tp-cart-checkout-wrapper">
      <div className="tp-cart-checkout-top d-flex align-items-center justify-content-between">
        <span className="tp-cart-checkout-top-title">Subtotal</span>
        <span className="tp-cart-checkout-top-price">{formatPrice(total)}</span>
      </div>
      <div className="tp-cart-checkout-shipping">
        <h4 className="tp-cart-checkout-shipping-title">Shipping</h4>
        <div className="tp-cart-checkout-shipping-option-wrapper">
          <div className="tp-cart-checkout-shipping-option">
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option value="">Select district</option>
              {BD_DISTRICTS.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {!district && <p>Select your delivery district to calculate shipping.</p>}
          {district && isShippingLoading && <p>Calculating shipping...</p>}
          {district && !isShippingLoading && shippingRates.length === 0 && (
            <p>{shippingError || "No shipping method available."}</p>
          )}
          {shippingRates.map((rate) => (
          <div key={rate.rateId} className="tp-cart-checkout-shipping-option">
            <input
              id={`cart_shipping_${rate.rateId}`}
              type="radio"
              name="shipping"
              checked={selectedRateId === rate.rateId}
              onChange={() => handleShippingRateSelect(rate)}
            />
            <label htmlFor={`cart_shipping_${rate.rateId}`}>
              {rate.name}: <span>{formatPrice(rate.price)}</span>
            </label>
          </div>
          ))}
        </div>
      </div>
      <div className="tp-cart-checkout-total d-flex align-items-center justify-content-between">
        <span>Total</span>
        <span>{formatPrice(total + shipCost)}</span>
      </div>
      <div className="tp-cart-checkout-proceed">
        <Link href="/checkout" className="tp-cart-checkout-btn w-100">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartCheckout;
