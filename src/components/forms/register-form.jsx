import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/router";
// internal
import { CloseEye, OpenEye } from "@/svg";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRegisterUserMutation } from "@/redux/features/auth/authApi";

// schema
const schema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  confirmPassword: Yup.string().required("Please confirm your password").oneOf([Yup.ref("password")], "Passwords must match"),
  consent: Yup.bool()
    .oneOf([true], "You must agree to the terms and conditions to proceed.")
    .label("Terms and Conditions"),
});

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const router = useRouter();
  const { redirect } = router.query;
  // react hook form
  const {register,handleSubmit,formState: { errors },reset,setFocus,watch} = useForm({
    resolver: yupResolver(schema),
  });
  const password = watch("password", "");
  const passwordStrength = password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : "Needs more characters";
  // on submit
  const onSubmit = async (data) => {
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      notifySuccess(result?.message || "Account created successfully");
      reset();
      router.push(redirect || "/profile");
    } catch (error) {
      notifyError(error?.data?.message || "Register failed");
    }
  };
  const onInvalid = (fieldErrors) => {
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField) setFocus(firstField);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      {Object.keys(errors).length > 0 && <div className="form-error-summary" role="alert">Please correct the highlighted fields.</div>}
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("name", { required: `Name is required!` })}
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Shahnewaz Sakil"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="name">Your Name</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email", { required: `Email is required!` })}
              id="email"
              name="email"
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
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password", { required: `Password is required!` })}
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                aria-describedby="register-password-help"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <button type="button" className="open-eye password-toggle" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Hide password" : "Show password"} aria-pressed={showPass}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </button>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">Password</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
          <p id="register-password-help" className="form-helper-text">Use 8 or more characters. Password strength: {passwordStrength}.</p>
        </div>
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input {...register("confirmPassword")} id="confirmPassword" type={showConfirmation ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" />
            </div>
            <div className="tp-login-input-eye">
              <button type="button" className="open-eye password-toggle" onClick={() => setShowConfirmation(!showConfirmation)} aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"} aria-pressed={showConfirmation}>
                {showConfirmation ? <CloseEye /> : <OpenEye />}
              </button>
            </div>
            <div className="tp-login-input-title"><label htmlFor="confirmPassword">Confirm Password</label></div>
          </div>
          <ErrorMsg msg={errors.confirmPassword?.message} />
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input
            {...register("consent", {
              required: `Terms and Conditions is required!`,
            })}
            id="consent"
            name="consent"
            type="checkbox"
          />
          <label htmlFor="consent">
            I accept the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          </label>
          <ErrorMsg msg={errors.consent?.message} />
        </div>
      </div>
      <div className="tp-login-bottom">
        <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
