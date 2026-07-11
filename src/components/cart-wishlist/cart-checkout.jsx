import React from "react";
import Link from "next/link";
import useCartInfo from "@/hooks/use-cart-info";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatPrice } from "@/utils/formatPrice";
import { BD_DISTRICTS } from "@/lib/bd-regions";
import { useValidateCouponMutation } from "@/redux/features/coupon/couponApi";
import { clear_coupon, set_coupon } from "@/redux/features/coupon/couponSlice";
import { notifyError, notifySuccess } from "@/utils/toast";
import { patch_shipping } from "@/redux/features/order/orderSlice";

const CartCheckout = () => {
  const {total} = useCartInfo();
  const { cart_products } = useSelector((state) => state.cart);
  const { coupon_info } = useSelector((state) => state.coupon);
  const { shipping_info } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const [validateCoupon, { isLoading: isCouponLoading }] = useValidateCouponMutation();
  const [shipCost,setShipCost] = useState(0);
  const [district, setDistrict] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRateId, setSelectedRateId] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  useEffect(() => {
    if (shipping_info.district) {
      setDistrict(shipping_info.district);
    }
  }, [shipping_info.district]);

  const handleShippingRateSelect = useCallback((rate, selectedDistrict = district) => {
    if (!rate) return;
    setSelectedRateId(rate.rateId);
    setShipCost(Number(rate.price || 0));
    dispatch(patch_shipping({
      district: selectedDistrict,
      city: selectedDistrict,
      shippingRateId: rate.rateId,
      shippingOption: rate.name,
      shippingCost: Number(rate.price || 0),
    }));
  }, [dispatch, district]);

  const handleDistrictChange = (event) => {
    const nextDistrict = event.target.value;
    setDistrict(nextDistrict);
    dispatch(patch_shipping({
      district: nextDistrict,
      city: nextDistrict,
      shippingRateId: "",
      shippingOption: "",
      shippingCost: 0,
    }));
  };

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
        if (selected) {
          const persistedRate = rates.find((rate) => rate.rateId === shipping_info.shippingRateId);
          handleShippingRateSelect(persistedRate || selected, district);
        }

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
  }, [cart_products, district, handleShippingRateSelect, shipping_info.shippingRateId]);

  const handleCouponSubmit = async (event) => {
    event.preventDefault();
    if (!couponCode.trim()) {
      notifyError("Please enter a coupon code.");
      return;
    }

    try {
      const response = await validateCoupon({
        code: couponCode,
        cart: cart_products,
      }).unwrap();
      dispatch(set_coupon(response.coupon));
      notifySuccess("Coupon applied.");
    } catch (error) {
      dispatch(clear_coupon());
      notifyError(error?.data?.message || error?.message || "Coupon could not be applied.");
    }
  };

  const discount = Number(coupon_info?.discountAmount || 0);

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
            <select value={district} onChange={handleDistrictChange}>
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
          {district && shippingRates.length > 0 && (
            <p className="mb-0">Estimated here. Final shipping is recalculated and confirmed at checkout.</p>
          )}
        </div>
      </div>
      <div className="tp-cart-coupon mb-25">
        <form onSubmit={handleCouponSubmit}>
          <div className="tp-cart-coupon-input-box">
            <label>Coupon Code:</label>
            <div className="tp-cart-coupon-input d-flex align-items-center">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter Coupon Code"
              />
              <button type="submit" disabled={isCouponLoading}>
                {isCouponLoading ? "Applying..." : "Apply"}
              </button>
            </div>
          </div>
        </form>
        {coupon_info && (
          <p className="mt-10 mb-0">
            Coupon <strong>{coupon_info.code}</strong> applied: -{formatPrice(discount)}
          </p>
        )}
      </div>
      <div className="tp-cart-checkout-top d-flex align-items-center justify-content-between">
        <span className="tp-cart-checkout-top-title">Discount</span>
        <span className="tp-cart-checkout-top-price">-{formatPrice(discount)}</span>
      </div>
      <div className="tp-cart-checkout-total d-flex align-items-center justify-content-between">
        <span>Total</span>
        <span>{formatPrice(total + shipCost - discount)}</span>
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
