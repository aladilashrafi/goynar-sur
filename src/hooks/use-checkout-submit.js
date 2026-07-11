import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
// internal import
import useCartInfo from "./use-cart-info";
import { patch_shipping, set_shipping } from "@/redux/features/order/orderSlice";
import { clear_cart_after_order } from "@/redux/features/cartSlice";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useSaveOrderMutation } from "@/redux/features/order/orderApi";
import { useValidateCouponMutation } from "@/redux/features/coupon/couponApi";
import { clear_coupon, set_coupon } from "@/redux/features/coupon/couponSlice";

const useCheckoutSubmit = () => {
  const [saveOrder] = useSaveOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const { cart_products } = useSelector((state) => state.cart);
  const { shipping_info } = useSelector((state) => state.order);
  const { accessToken, user } = useSelector((state) => state.auth);
  const { coupon_info } = useSelector((state) => state.coupon);
  const { total, setTotal } = useCartInfo();
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingRateId, setSelectedShippingRateId] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [couponApplyMsg, setCouponApplyMsg] = useState("");
  const couponRef = useRef(null);
  const discountAmount = Number(coupon_info?.discountAmount || 0);

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
      saveToAccount: false,
    },
  });

  const finalShippingCost = coupon_info?.freeShipping ? 0 : shippingCost;
  const cartTotal = total + finalShippingCost - discountAmount;

  const selectedShippingRate =
    shippingRates.find((rate) => rate.rateId === selectedShippingRateId) || shippingRates[0] || null;

  const handleShippingRateSelect = useCallback((rate) => {
    if (!rate) return;
    setSelectedShippingRateId(rate.rateId);
    setShippingCost(Number(rate.price || 0));
    setValue("shippingRateId", rate.rateId);
    setValue("shippingOption", rate.name);
    dispatch(patch_shipping({
      shippingRateId: rate.rateId,
      shippingOption: rate.name,
      shippingCost: Number(rate.price || 0),
    }));
  }, [dispatch, setValue]);

  useEffect(() => {
    const billing = user?.customer?.billing || {};
    const savedFirstName = billing.first_name || user?.customer?.first_name || "";
    const savedLastName = billing.last_name || user?.customer?.last_name || "";
    const savedDistrict = billing.city || billing.state || "";

    setValue("firstName", shipping_info.firstName || savedFirstName || "");
    setValue("lastName", shipping_info.lastName || savedLastName || "");
    setValue("country", "Bangladesh");
    setValue("address", shipping_info.address || billing.address_1 || "");
    setValue("district", shipping_info.district || shipping_info.city || savedDistrict || "");
    setValue("upazila", shipping_info.upazila || billing.address_2 || "");
    setValue("zipCode", shipping_info.zipCode || billing.postcode || "");
    setValue("contactNo", shipping_info.contactNo || billing.phone || user?.phone || "");
    setValue("email", shipping_info.email || billing.email || user?.email || "");
    setValue("orderNote", shipping_info.orderNote || "");
    setValue("payment", "COD");
    setValue("shippingOption", shipping_info.shippingOption || "");
    setValue("shippingRateId", shipping_info.shippingRateId || "");
  }, [setValue, shipping_info, user]);

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

    dispatch(patch_shipping({ district, city: district }));

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

        const persistedRate = data.rates?.find(
          (rate) => rate.rateId === shipping_info.shippingRateId
        );

        if (persistedRate || data.selectedRate) {
          handleShippingRateSelect(persistedRate || data.selectedRate);
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
  }, [address, cart_products, dispatch, district, handleShippingRateSelect, shipping_info.shippingRateId, upazila]);

  useEffect(() => {
    if (coupon_info && !cart_products.length) {
      dispatch(clear_coupon());
      setCouponApplyMsg("");
    }
  }, [cart_products.length, coupon_info, dispatch]);

  const handleCouponCode = async (event) => {
    event?.preventDefault();
    const code = couponRef.current?.value?.trim();

    if (!code) {
      notifyError("Please enter a coupon code.");
      return;
    }

    try {
      const response = await validateCoupon({
        code,
        cart: cart_products,
        email: watch("email"),
        customerId: user?.id || user?._id || user?.customer?.id,
      }).unwrap();
      dispatch(set_coupon(response.coupon));
      setCouponApplyMsg(`${response.coupon.code} applied successfully.`);
      notifySuccess("Coupon applied.");
    } catch (error) {
      dispatch(clear_coupon());
      setCouponApplyMsg("");
      notifyError(error?.data?.message || error?.message || "Coupon could not be applied.");
    }
  };

  const submitHandler = async (data) => {
    if (!cart_products.length) {
      notifyError("Your cart is empty.");
      return;
    }

    if (isShippingLoading) {
      notifyError("Please wait while shipping options are calculated.");
      return;
    }

    if (!selectedShippingRate) {
      notifyError("Please select a shipping method.");
      return;
    }

    const firstName = String(data.firstName || "").trim();
    const lastName = String(data.lastName || "").trim();
    const phone = String(data.contactNo || "").trim();
    const email = String(data.email || "").trim();
    const districtValue = String(data.district || "").trim();
    const upazilaValue = String(data.upazila || "").trim();
    const addressValue = String(data.address || "").trim();

    if (!firstName || !phone || !districtValue || !upazilaValue || !addressValue) {
      notifyError("Please complete the required checkout fields.");
      return;
    }

    dispatch(set_shipping({
      ...data,
      district: districtValue,
      city: districtValue,
      shippingRateId: selectedShippingRate.rateId,
      shippingOption: selectedShippingRate.name,
      shippingCost: finalShippingCost,
    }));
    setIsCheckoutSubmit(true);

    const orderPayload = {
      firstName,
      lastName,
      phone,
      contactNo: phone,
      email,
      address: addressValue,
      district: districtValue,
      city: districtValue,
      upazila: upazilaValue,
      address_2: upazilaValue,
      country: "Bangladesh",
      zipCode: String(data.zipCode || "").trim(),
      orderNote: String(data.orderNote || "").trim(),
      cart: cart_products,
      subTotal: total,
      shippingCost: finalShippingCost,
      shippingOption: selectedShippingRate.name,
      shippingRateId: selectedShippingRate.rateId,
      discount: discountAmount,
      coupon: coupon_info
        ? {
            code: coupon_info.code,
            discountAmount,
            discountType: coupon_info.discountType,
          }
        : undefined,
      totalAmount: cartTotal,
      paymentMethod: "cod",
      customerId: user?.id || user?._id || user?.customer?.id,
    };

    try {
      const order = await saveOrder(orderPayload).unwrap();
      if (accessToken && data.saveToAccount) {
        const profileResponse = await fetch("/api/account/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: [data.firstName, data.lastName].filter(Boolean).join(" "),
            email,
            phone,
            billing: {
              first_name: firstName,
              last_name: lastName || firstName,
              email,
              phone,
              address_1: addressValue,
              address_2: upazilaValue,
              city: districtValue,
              state: districtValue,
              postcode: String(data.zipCode || "").trim(),
              country: "BD",
            },
            shipping: {
              first_name: firstName,
              last_name: lastName || firstName,
              address_1: addressValue,
              address_2: upazilaValue,
              city: districtValue,
              state: districtValue,
              postcode: String(data.zipCode || "").trim(),
              country: "BD",
            },
          }),
        });

        if (!profileResponse.ok) {
          notifyError("Order placed, but saved account details could not be updated.");
        }
      }
      localStorage.removeItem("cart_products");
      dispatch(clear_coupon());
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
    handleCouponCode,
    couponRef,
    handleShippingRateSelect,
    discountAmount,
    total,
    shippingCost: finalShippingCost,
    discountPercentage: coupon_info?.discountType === "percent" ? Number(coupon_info.amount || 0) : 0,
    discountProductType: coupon_info?.discountType || "",
    isCheckoutSubmit,
    setTotal,
    register,
    errors,
    submitHandler,
    handleSubmit,
    cartTotal,
    couponApplyMsg,
    watch,
    shippingRates,
    selectedShippingRateId,
    selectedShippingRate,
    shippingError,
    isShippingLoading,
    accessToken,
  };
};

export default useCheckoutSubmit;
