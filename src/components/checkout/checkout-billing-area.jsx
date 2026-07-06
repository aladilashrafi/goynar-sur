import React from "react";
import ErrorMsg from "../common/error-msg";
import { useSelector } from "react-redux";
import { BD_DISTRICTS } from "@/lib/bd-regions";

const CheckoutBillingArea = ({ register, errors, watch }) => {
  const { user } = useSelector((state) => state.auth);
  const selectedDistrict = watch?.("district");
  const district = BD_DISTRICTS.find((item) => item.name === selectedDistrict);
  const upazilas = district?.upazilas || [];

  return (
    <div className="tp-checkout-bill-area">
      <h3 className="tp-checkout-bill-title">Billing Details</h3>

      <div className="tp-checkout-bill-form">
        <div className="tp-checkout-bill-inner">
          <div className="row">
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>
                  First Name <span>*</span>
                </label>
                <input
                  {...register("firstName", {
                    required: `firstName is required!`,
                  })}
                  name="firstName"
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  defaultValue={user?.firstName}
                />
                <ErrorMsg msg={errors?.firstName?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>Last Name</label>
                <input
                  {...register("lastName")}
                  name="lastName"
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                />
                <ErrorMsg msg={errors?.lastName?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>
                  Address <span>*</span>
                </label>
                <input
                  {...register("address", { required: `Address is required!` })}
                  name="address"
                  id="address"
                  type="text"
                  placeholder="House, road, village or street"
                />
                <ErrorMsg msg={errors?.address?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>
                  District <span>*</span>
                </label>
                <select
                  {...register("district", { required: `District is required!` })}
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
                <label>
                  Upazila / Area <span>*</span>
                </label>
                <select
                  {...register("upazila", { required: `Upazila or area is required!` })}
                  name="upazila"
                  id="upazila"
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
                <label>
                  Phone <span>*</span>
                </label>
                <input
                  {...register("contactNo", {
                    required: `ContactNumber is required!`,
                  })}
                  name="contactNo"
                  id="contactNo"
                  type="text"
                  placeholder="Phone"
                />
                <ErrorMsg msg={errors?.contactNo?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>Email address</label>
                <input
                  {...register("email")}
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={user?.email}
                />
                <ErrorMsg msg={errors?.email?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>Order notes (optional)</label>
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
