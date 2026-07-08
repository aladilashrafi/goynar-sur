import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const schema = Yup.object().shape({
  password: Yup.string().required().min(6).label("Current Password"),
  newPassword: Yup.string().required().min(6).label("New Password"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("newPassword"), null],
    "Passwords must match"
  ),
});

const ChangePassword = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await changePassword({
        currentPassword: data.password,
        password: data.newPassword,
      }).unwrap();
      notifySuccess(result?.message || "Password updated successfully");
      reset();
    } catch (error) {
      notifyError(error?.data?.message || "Unable to update password");
    }
  };

  return (
    <div className="profile__password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-xxl-12">
            <div className="tp-profile-input-box">
              <div className="tp-contact-input">
                <input
                  {...register("password", {
                    required: `Password is required!`,
                  })}
                  name="password"
                  id="password"
                  type="password"
                />
              </div>
              <div className="tp-profile-input-title">
                <label htmlFor="password">Old Password</label>
              </div>
              <ErrorMsg msg={errors.password?.message} />
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="tp-profile-input-box">
              <div className="tp-profile-input">
                <input
                  {...register("newPassword", {
                    required: `New Password is required!`,
                  })}
                  name="newPassword"
                  id="newPassword"
                  type="password"
                />
              </div>
              <div className="tp-profile-input-title">
                <label htmlFor="newPassword">New Password</label>
              </div>
              <ErrorMsg msg={errors.newPassword?.message} />
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="tp-profile-input-box">
              <div className="tp-profile-input">
                <input
                  {...register("confirmPassword")}
                  name="confirmPassword"
                  id="confirmPassword"
                  type="password"
                />
              </div>
              <div className="tp-profile-input-title">
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>
              <ErrorMsg msg={errors.confirmPassword?.message} />
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="profile__btn">
              <button type="submit" className="tp-btn" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
