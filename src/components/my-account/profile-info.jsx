import React, { useEffect, useMemo } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { BD_DISTRICTS } from "@/lib/bd-regions";
import { EmailTwo, LocationTwo, PhoneThree, UserThree } from "@/svg";
import { useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const schema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  phone: Yup.string().required().min(11).label("Phone"),
  billingAddress: Yup.string().required().label("Billing address"),
  billingDistrict: Yup.string().required().label("Billing district"),
  billingUpazila: Yup.string().required().label("Billing upazila"),
});

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function districtOptions(districtName) {
  return BD_DISTRICTS.find((district) => district.name === districtName)?.upazilas || [];
}

const ProfileInfo = () => {
  const { user } = useSelector((state) => state.auth);
  const customer = useMemo(() => user?.customer || {}, [user]);
  const billing = useMemo(() => customer.billing || {}, [customer]);
  const shipping = useMemo(() => customer.shipping || {}, [customer]);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      sameAsBilling: true,
    },
  });

  const billingDistrict = watch("billingDistrict");
  const billingAddress = watch("billingAddress");
  const billingUpazila = watch("billingUpazila");
  const billingPostcode = watch("billingPostcode");
  const shippingDistrict = watch("shippingDistrict");
  const sameAsBilling = watch("sameAsBilling");

  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || billing.phone || "",
      billingAddress: billing.address_1 || "",
      billingUpazila: billing.address_2 || "",
      billingDistrict: billing.city || billing.state || "",
      billingPostcode: billing.postcode || "",
      shippingAddress: shipping.address_1 || billing.address_1 || "",
      shippingUpazila: shipping.address_2 || billing.address_2 || "",
      shippingDistrict: shipping.city || shipping.state || billing.city || billing.state || "",
      shippingPostcode: shipping.postcode || billing.postcode || "",
      sameAsBilling:
        !shipping.address_1 ||
        (shipping.address_1 === billing.address_1 &&
          shipping.address_2 === billing.address_2 &&
          (shipping.city || shipping.state) === (billing.city || billing.state)),
    });
  }, [billing, reset, shipping, user]);

  useEffect(() => {
    if (!sameAsBilling) return;
    setValue("shippingAddress", billingAddress || "");
    setValue("shippingUpazila", billingUpazila || "");
    setValue("shippingDistrict", billingDistrict || "");
    setValue("shippingPostcode", billingPostcode || "");
  }, [billingAddress, billingDistrict, billingPostcode, billingUpazila, sameAsBilling, setValue]);

  const onSubmit = async (data) => {
    const { firstName, lastName } = splitName(data.name);
    const shippingAddress = data.sameAsBilling
      ? {
          address: data.billingAddress,
          upazila: data.billingUpazila,
          district: data.billingDistrict,
          postcode: data.billingPostcode,
        }
      : {
          address: data.shippingAddress,
          upazila: data.shippingUpazila,
          district: data.shippingDistrict,
          postcode: data.shippingPostcode,
        };

    try {
      const result = await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: data.email,
          phone: data.phone,
          address_1: data.billingAddress,
          address_2: data.billingUpazila,
          city: data.billingDistrict,
          state: data.billingDistrict,
          postcode: data.billingPostcode || "",
          country: "BD",
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: shippingAddress.address || "",
          address_2: shippingAddress.upazila || "",
          city: shippingAddress.district || "",
          state: shippingAddress.district || "",
          postcode: shippingAddress.postcode || "",
          country: "BD",
        },
      }).unwrap();
      notifySuccess(result?.message || "Profile updated successfully");
    } catch (error) {
      notifyError(error?.data?.message || "Unable to update profile");
    }
  };

  return (
    <div className="profile__info">
      <h3 className="profile__info-title">Personal & Address Details</h3>
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12">
              <h5 className="mb-20">Personal Information</h5>
            </div>
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("name")} name="name" type="text" placeholder="Enter your name" />
                  <span><UserThree /></span>
                  <ErrorMsg msg={errors.name?.message} />
                </div>
              </div>
            </div>
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("email")} name="email" type="email" placeholder="Enter your email" />
                  <span><EmailTwo /></span>
                  <ErrorMsg msg={errors.email?.message} />
                </div>
              </div>
            </div>
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("phone")} name="phone" type="text" placeholder="Enter your phone number" />
                  <span><PhoneThree /></span>
                  <ErrorMsg msg={errors.phone?.message} />
                </div>
              </div>
            </div>

            <div className="col-12 mt-20">
              <h5 className="mb-20">Billing Address</h5>
            </div>
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("billingAddress")} type="text" placeholder="House, road, village or street" />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.billingAddress?.message} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <select {...register("billingDistrict")}>
                    <option value="">Select district</option>
                    {BD_DISTRICTS.map((district) => (
                      <option key={district.name} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                  <ErrorMsg msg={errors.billingDistrict?.message} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <select {...register("billingUpazila")}>
                    <option value="">Select upazila / area</option>
                    {districtOptions(billingDistrict).map((upazila) => (
                      <option key={upazila} value={upazila}>{upazila}</option>
                    ))}
                  </select>
                  <ErrorMsg msg={errors.billingUpazila?.message} />
                </div>
              </div>
            </div>
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("billingPostcode")} type="text" placeholder="Postcode (optional)" />
                </div>
              </div>
            </div>

            <div className="col-12 mt-20">
              <div className="tp-checkout-option mb-20">
                <input {...register("sameAsBilling")} id="sameAsBilling" type="checkbox" />
                <label htmlFor="sameAsBilling">Shipping address is same as billing</label>
              </div>
            </div>

            {!sameAsBilling && (
              <>
                <div className="col-12">
                  <h5 className="mb-20">Shipping Address</h5>
                </div>
                <div className="col-xxl-12">
                  <div className="profile__input-box">
                    <div className="profile__input">
                      <input {...register("shippingAddress")} type="text" placeholder="House, road, village or street" />
                      <span><LocationTwo /></span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="profile__input-box">
                    <div className="profile__input">
                      <select {...register("shippingDistrict")}>
                        <option value="">Select district</option>
                        {BD_DISTRICTS.map((district) => (
                          <option key={district.name} value={district.name}>{district.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="profile__input-box">
                    <div className="profile__input">
                      <select {...register("shippingUpazila")}>
                        <option value="">Select upazila / area</option>
                        {districtOptions(shippingDistrict).map((upazila) => (
                          <option key={upazila} value={upazila}>{upazila}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-xxl-12">
                  <div className="profile__input-box">
                    <div className="profile__input">
                      <input {...register("shippingPostcode")} type="text" placeholder="Postcode (optional)" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="col-xxl-12">
              <div className="profile__btn">
                <button type="submit" className="tp-btn" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Details"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;
