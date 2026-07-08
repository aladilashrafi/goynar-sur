import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// internal
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import LoginShapes from "@/components/login-register/login-shapes";
import ErrorMsg from "@/components/common/error-msg";
import { useConfirmForgotPasswordMutation } from "@/redux/features/auth/authApi";
import { CloseEye, OpenEye } from "@/svg";
import { notifyError, notifySuccess } from "@/utils/toast";
import SEO from "@/components/seo";

const schema = Yup.object().shape({
  password: Yup.string().required().min(6).label("Password"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password"), null],
    "Passwords must match"
  ),
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const { email, token } = router.query;
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [confirmForgotPassword, { isLoading }] = useConfirmForgotPasswordMutation();
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
      const result = await confirmForgotPassword({
        email,
        token,
        password: data.password,
      }).unwrap();
      notifySuccess(result?.message || "Your password has been updated.");
      reset();
      router.push("/login");
    } catch (error) {
      notifyError(error?.data?.message || "Unable to reset password");
    }
  };

  const missingResetData = !email || !token;

  return (
    <Wrapper>
      <SEO pageTitle="Reset Password" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Reset Password" subtitle="Account" center={true} />
      <section className="tp-login-area pb-140 p-relative z-index-1 fix">
        <LoginShapes />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">Set a new password</h3>
                  <p>Choose a new password for your Goynar Sur account.</p>
                </div>
                <div className="tp-login-option">
                  {missingResetData ? (
                    <p className="text-center">
                      This reset link is missing required information. Please request a new reset email.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="tp-login-input-wrapper">
                        <div className="tp-login-input-box">
                          <div className="p-relative">
                            <div className="tp-login-input">
                              <input
                                {...register("password", { required: `Password is required!` })}
                                id="password"
                                name="password"
                                type={showPass ? "text" : "password"}
                                placeholder="Min. 6 character"
                              />
                            </div>
                            <div className="tp-login-input-eye" id="password-show-toggle">
                              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <CloseEye /> : <OpenEye />}
                              </span>
                            </div>
                            <div className="tp-login-input-title">
                              <label htmlFor="password">Password</label>
                            </div>
                          </div>
                          <ErrorMsg msg={errors.password?.message} />
                        </div>
                        <div className="tp-login-input-box">
                          <div className="p-relative">
                            <div className="tp-login-input">
                              <input
                                {...register("confirmPassword")}
                                type={showConPass ? "text" : "password"}
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                id="confirmPassword"
                              />
                            </div>
                            <div className="tp-login-input-eye" id="password-show-confirm-toggle">
                              <span className="open-eye" onClick={() => setShowConPass(!showConPass)}>
                                {showConPass ? <CloseEye /> : <OpenEye />}
                              </span>
                            </div>
                            <div className="tp-login-input-title">
                              <label htmlFor="confirmPassword">Confirm Password</label>
                            </div>
                          </div>
                          <ErrorMsg msg={errors.confirmPassword?.message} />
                        </div>
                      </div>

                      <div className="tp-login-bottom">
                        <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
                          {isLoading ? "Updating..." : "Confirm Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ResetPasswordPage;
