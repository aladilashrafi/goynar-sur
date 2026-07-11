import React from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

// schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
});

const ForgotForm = () => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
    // react hook form
    const {register,handleSubmit,formState: { errors },reset} = useForm({
      resolver: yupResolver(schema), 
    });
    // onSubmit
    const onSubmit = async (data) => {
      try {
        const result = await resetPassword({
          email: data.email,
        }).unwrap();
        notifySuccess(result?.message || "If that email exists, we sent password reset instructions.");
      } catch (error) {
        notifyError(error?.data?.message || "Unable to send reset email");
      }
      reset();
    };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email", { required: `Email is required!` })}
              name="email"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
      </div>
      <div className="tp-login-bottom mb-15">
        <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Mail"}
        </button>
      </div>
    </form>
  );
};

export default ForgotForm;
