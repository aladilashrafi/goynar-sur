import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from 'next/router';
import Link from 'next/link';
// internal
import { CloseEye, OpenEye } from '@/svg';
import ErrorMsg from '../common/error-msg';
import { useLoginUserMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';


// schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});
const LoginForm = ({ redirectTo }) => {
  const [showPass, setShowPass] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const router = useRouter();
  const { redirect } = router.query;
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm({
    resolver: yupResolver(schema),
  });
  // onSubmit
  const onSubmit = async (data) => {
    try {
      await loginUser({
        email: data.email,
        password: data.password,
        remember: data.remember,
      }).unwrap();
      notifySuccess("Login successful");
      reset();
      router.push(redirectTo || redirect || "/profile");
    } catch (error) {
      notifyError(error?.data?.message || "Unable to login");
    }
  };
  const onInvalid = (fieldErrors) => {
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField) setFocus(firstField);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      {Object.keys(errors).length > 0 && (
        <div className="form-error-summary" role="alert" tabIndex="-1">
          Please correct the highlighted fields and try again.
        </div>
      )}
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input {...register("email")} name="email" id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} placeholder="you@example.com" />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
          <ErrorMsg id="login-email-error" msg={errors.email?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password", { required: `Password is required!` })}
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                placeholder="Min. 6 character"
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
          <ErrorMsg id="login-password-error" msg={errors.password?.message}/>
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input {...register("remember")} id="remember" type="checkbox" />
          <label htmlFor="remember">Remember me for 30 days</label>
        </div>
        <div className="tp-login-forgot">
          <Link href="/forgot">Forgot Password?</Link>
        </div>
      </div>
      <div className="tp-login-bottom">
        <button type='submit' className="tp-login-btn w-100" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
