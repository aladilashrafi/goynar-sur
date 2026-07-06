import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
// internal import
import useCartInfo from "./use-cart-info";
import { set_shipping } from "@/redux/features/order/orderSlice";
import { clear_cart_after_order } from "@/redux/features/cartSlice";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useSaveOrderMutation } from "@/redux/features/order/orderApi";

const useCheckoutSubmit = () => {
  const [saveOrder] = useSaveOrderMutation();
  const { cart_products } = useSelector((state) => state.cart);
  const { shipping_info } = useSelector((state) => state.order);
  const { total, setTotal } = useCartInfo();
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingRateId, setSelectedShippingRateId] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const discountAmount = 0;

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      country: "Bangladesh",
      zipCode: "",
      payment: "COD",
      shippingOption: "",
      shippingRateId: "",
    },
  });

  const cartTotal = total + shippingCost - discountAmount;

  const selectedShippingRate =
    shippingRates.find((rate) => rate.rateId === selectedShippingRateId) || shippingRates[0] || null;

  const handleShippingRateSelect = useCallback((rate) => {
    if (!rate) return;
    setSelectedShippingRateId(rate.rateId);
    setShippingCost(Number(rate.price || 0));
    setValue("shippingRateId", rate.rateId);
    setValue("shippingOption", rate.name);
  }, [setValue]);

  useEffect(() => {
    setValue("firstName", shipping_info.firstName || "");
    setValue("lastName", shipping_info.lastName || "");
    setValue("country", "Bangladesh");
    setValue("address", shipping_info.address || "");
    setValue("district", shipping_info.district || shipping_info.city || "");
    setValue("upazila", shipping_info.upazila || "");
    setValue("zipCode", "");
    setValue("contactNo", shipping_info.contactNo || "");
    setValue("email", shipping_info.email || "");
    setValue("orderNote", shipping_info.orderNote || "");
    setValue("payment", "COD");
    setValue("shippingOption", shipping_info.shippingOption || "");
    setValue("shippingRateId", shipping_info.shippingRateId || "");
  }, [setValue, shipping_info]);

  const district = watch("district");
  const upazila = watch("upazila");
  const address = watch("address");

  useEffect(() => {
    if (!cart_products.length || !district) {
      setShippingRates([]);
      setSelectedShippingRateId("");
      setShippingCost(0);
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
          body: JSON.stringify({
            cart: cart_products,
            district,
            upazila,
            address,
            zipCode: "",
          }),
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to calculate shipping.");
        }

        setShippingRates(data.rates || []);

        if (data.selectedRate) {
          handleShippingRateSelect(data.selectedRate);
        } else if (data.rates?.[0]) {
          handleShippingRateSelect(data.rates[0]);
        } else {
          setSelectedShippingRateId("");
          setShippingCost(0);
          setShippingError("No shipping method is available for this address.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setShippingRates([]);
          setSelectedShippingRateId("");
          setShippingCost(0);
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
  }, [address, cart_products, district, handleShippingRateSelect, upazila]);

  const submitHandler = async (data) => {
    if (!cart_products.length) {
      notifyError("Your cart is empty.");
      return;
    }

    if (!selectedShippingRate) {
      notifyError("Please select a shipping method.");
      return;
    }

    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    const orderPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.contactNo,
      contactNo: data.contactNo,
      email: data.email,
      address: data.address,
      district: data.district,
      city: data.district,
      upazila: data.upazila,
      address_2: data.upazila,
      country: "Bangladesh",
      zipCode: "",
      orderNote: data.orderNote,
      cart: cart_products,
      subTotal: total,
      shippingCost,
      shippingOption: selectedShippingRate.name,
      shippingRateId: selectedShippingRate.rateId,
      discount: discountAmount,
      totalAmount: cartTotal,
      paymentMethod: "cod",
    };

    try {
      const order = await saveOrder(orderPayload).unwrap();
      localStorage.removeItem("cart_products");
      localStorage.removeItem("couponInfo");
      localStorage.removeItem("shipping_info");
      dispatch(clear_cart_after_order());
      notifySuccess("Your order is confirmed.");
      router.push(`/order/${order.id}`);
    } catch (error) {
      const message = error?.data?.message || error?.message || "Unable to place order. Please try again.";
      notifyError(message);
      setIsCheckoutSubmit(false);
    }
  };

  return {
    handleCouponCode: (event) => event?.preventDefault(),
    couponRef: null,
    handleShippingRateSelect,
    discountAmount,
    total,
    shippingCost,
    discountPercentage: 0,
    discountProductType: "",
    isCheckoutSubmit,
    setTotal,
    register,
    errors,
    submitHandler,
    handleSubmit,
    cartTotal,
    couponApplyMsg: "",
    watch,
    shippingRates,
    selectedShippingRateId,
    selectedShippingRate,
    shippingError,
    isShippingLoading,
  };
};

export default useCheckoutSubmit;
