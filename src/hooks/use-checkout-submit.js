import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { normalizeAccountCheckout } from "@/utils/normalizeAccountCheckout";
import { BD_DISTRICTS } from "@/lib/bd-regions";

const checkoutDefaults = {
  firstName: "",
  lastName: "",
  country: "Bangladesh",
  address: "",
  district: "",
  upazila: "",
  zipCode: "",
  contactNo: "",
  email: "",
  orderNote: "",
  payment: "COD",
  shippingOption: "",
  shippingRateId: "",
  saveToAccount: false,
};

function buildCheckoutDefaults(shippingInfo = {}, user) {
  const saved = normalizeAccountCheckout(user);

  return {
    ...checkoutDefaults,
    firstName: shippingInfo.firstName || saved.firstName,
    lastName: shippingInfo.lastName || saved.lastName,
    address: shippingInfo.address || saved.address,
    district: shippingInfo.district || shippingInfo.city || saved.district,
    upazila: shippingInfo.upazila || saved.upazila,
    zipCode: shippingInfo.zipCode || saved.postcode,
    contactNo: shippingInfo.contactNo || saved.phone,
    email: shippingInfo.email || saved.email,
    orderNote: shippingInfo.orderNote || "",
    shippingOption: shippingInfo.shippingOption || "",
    shippingRateId: shippingInfo.shippingRateId || "",
  };
}

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
  const hydratedFormSignatureRef = useRef("");
  const discountAmount = Number(coupon_info?.discountAmount || 0);

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: checkoutDefaults,
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

  const userKey = user?.id || user?._id || user?.customer?.id || user?.email || "guest";
  const savedAccountCheckout = useMemo(() => normalizeAccountCheckout(user), [user]);
  const checkoutHydrationSignature = useMemo(
    () => JSON.stringify({
      userKey,
      savedFirstName: savedAccountCheckout.firstName,
      savedLastName: savedAccountCheckout.lastName,
      savedAddress: savedAccountCheckout.address,
      savedDistrict: savedAccountCheckout.district,
      savedUpazila: savedAccountCheckout.upazila,
      savedPostcode: savedAccountCheckout.postcode,
      savedPhone: savedAccountCheckout.phone,
      savedEmail: savedAccountCheckout.email,
      firstName: shipping_info.firstName || "",
      lastName: shipping_info.lastName || "",
      address: shipping_info.address || "",
      district: shipping_info.district || shipping_info.city || "",
      upazila: shipping_info.upazila || "",
      zipCode: shipping_info.zipCode || "",
      contactNo: shipping_info.contactNo || "",
      email: shipping_info.email || "",
      orderNote: shipping_info.orderNote || "",
    }),
    [
      userKey,
      savedAccountCheckout,
      shipping_info.firstName,
      shipping_info.lastName,
      shipping_info.address,
      shipping_info.district,
      shipping_info.city,
      shipping_info.upazila,
      shipping_info.zipCode,
      shipping_info.contactNo,
      shipping_info.email,
      shipping_info.orderNote,
    ]
  );
  const hasDirtyFields = Object.keys(dirtyFields || {}).length > 0;

  useEffect(() => {
    if (hydratedFormSignatureRef.current === checkoutHydrationSignature) {
      return;
    }

    hydratedFormSignatureRef.current = checkoutHydrationSignature;
    reset(buildCheckoutDefaults(shipping_info, user), {
      keepDirtyValues: hasDirtyFields,
      keepErrors: true,
    });
  }, [checkoutHydrationSignature, hasDirtyFields, reset, shipping_info, user]);

  const district = watch("district");
  const upazila = watch("upazila");
  const address = watch("address");
  const contactNo = watch("contactNo");
  const firstName = watch("firstName");
  const isCheckoutReady = Boolean(
    firstName && contactNo && address && district && upazila && selectedShippingRate && !isShippingLoading
  );

  useEffect(() => {
    if (!district || !upazila) return;

    const selectedDistrict = BD_DISTRICTS.find((item) => item.name === district);
    if (selectedDistrict && !selectedDistrict.upazilas.includes(upazila)) {
      setValue("upazila", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [district, setValue, upazila]);

  useEffect(() => {
    if (!cart_products.length || !district) {
      setShippingRates([]);
      setSelectedShippingRateId("");
      setShippingCost(0);
      return;
    }

    if (shipping_info.district !== district || shipping_info.city !== district) {
      dispatch(patch_shipping({ district, city: district }));
    }

    let cancelled = false;
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
        });
        const data = await response.json();

        if (cancelled) {
          return;
        }

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
        if (!cancelled) {
          setShippingRates([]);
          setSelectedShippingRateId("");
          setShippingCost(0);
          setShippingError(error.message || "Unable to calculate shipping.");
        }
      } finally {
        if (!cancelled) {
          setIsShippingLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    address,
    cart_products,
    dispatch,
    district,
    handleShippingRateSelect,
    shipping_info.city,
    shipping_info.district,
    shipping_info.shippingRateId,
    upazila,
  ]);

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
    isCheckoutReady,
  };
};

export default useCheckoutSubmit;
