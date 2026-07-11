import React from "react";
import ErrorMsg from "../common/error-msg";
import { useSelector } from "react-redux";
import { BD_DISTRICTS } from "@/lib/bd-regions";
import Link from "next/link";
import { normalizeAccountCheckout } from "@/utils/normalizeAccountCheckout";

const CheckoutBillingArea = ({ register, errors, watch }) => {
  const { user } = useSelector((state) => state.auth);
  const selectedDistrict = watch?.("district");
  const district = BD_DISTRICTS.find((item) => item.name === selectedDistrict);
  const upazilas = district?.upazilas || [];
  const saved = normalizeAccountCheckout(user);
  const accountMessage = saved.completeness === "complete"
    ? "Delivery details prefilled from your account."
    : saved.completeness === "partial"
      ? "Some saved details were added—complete the remaining fields."
      : "No saved delivery address—add one for this order.";

  return (
    <div className="tp-checkout-bill-area">
      <h3 className="tp-checkout-bill-title">Billing Details</h3>
      {user && (
        <p className="alert alert-success mb-25">
          {accountMessage} You can edit these fields for this order.{" "}
          <Link href="/profile?section=information">Manage saved address</Link>
        </p>
      )}

      <div className="tp-checkout-bill-form">
        <div className="tp-checkout-bill-inner">
          <div className="row">
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label htmlFor="firstName">
                  First Name <span>*</span>
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required.",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters.",
                    },
                  })}
                  name="firstName"
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="First Name"
                />
                <ErrorMsg msg={errors?.firstName?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label htmlFor="lastName">Last Name</label>
                <input
                  {...register("lastName")}
                  name="lastName"
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last Name"
                />
                <ErrorMsg msg={errors?.lastName?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label htmlFor="address">
                  Address <span>*</span>
                </label>
                <input
                  {...register("address", { required: `Address is required!` })}
                  name="address"
                  id="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="House, road, village or street"
                />
                <ErrorMsg msg={errors?.address?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label htmlFor="district">
                  District <span>*</span>
                </label>
                <select
                  {...register("district", { required: "District is required." })}
                  name="district"
                  id="district"
                >
                  <option value="">Select district</option>
                  {BD_DISTRICTS.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                 <ErrorMsg msg={errors?.district?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label htmlFor="upazila">
                  Upazila / Area <span>*</span>
                </label>
                <select
                  {...register("upazila", { required: "Upazila or area is required." })}
                  name="upazila"
                  id="upazila"
                  disabled={!selectedDistrict}
                >
                  <option value="">Select upazila / area</option>
                  {upazilas.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ErrorMsg msg={errors?.upazila?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label htmlFor="contactNo">
                  Phone <span>*</span>
                </label>
                <input
                  {...register("contactNo", {
                    required: "Phone number is required.",
                    pattern: {
                      value: /^(?:\+?88)?01[3-9]\d{8}$/,
                      message: "Enter a valid Bangladesh mobile number.",
                    },
                  })}
                  name="contactNo"
                  id="contactNo"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Phone"
                />
                <ErrorMsg msg={errors?.contactNo?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label htmlFor="email">Email address</label>
                <input
                  {...register("email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                />
                <ErrorMsg msg={errors?.email?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label htmlFor="zipCode">Postcode (optional)</label>
                <input
                  {...register("zipCode")}
                  name="zipCode"
                  id="zipCode"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="Postcode"
                />
                <ErrorMsg msg={errors?.zipCode?.message} />
              </div>
            </div>
            {user && (
              <div className="col-md-12">
                <div className="tp-checkout-option mb-20">
                  <input
                    {...register("saveToAccount")}
                    name="saveToAccount"
                    id="saveToAccount"
                    type="checkbox"
                  />
                  <label htmlFor="saveToAccount">Save these details to my account after this order succeeds</label>
                </div>
              </div>
            )}
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label htmlFor="orderNote">Order notes (optional)</label>
                <textarea
                  {...register("orderNote", { required: false })}
                  name="orderNote"
                  id="orderNote"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutBillingArea;
