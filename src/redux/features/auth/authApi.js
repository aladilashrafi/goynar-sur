import { apiSlice } from "@/redux/api/apiSlice";
import Cookies from "js-cookie";
import { userLoggedIn } from "./authSlice";

function persistSession(dispatch, session, remember = false) {
  if (!session?.accessToken || !session?.user) return;

  const userInfo = {
    accessToken: session.accessToken,
    user: session.user,
  };

  Cookies.set("userInfo", JSON.stringify(userInfo), {
    ...(remember ? { expires: 30 } : {}),
    sameSite: "lax",
  });

  dispatch(userLoggedIn(userInfo));
}

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/api/auth/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistSession(dispatch, data);
      },
    }),
    signUpProvider: builder.mutation({
      queryFn: async () => ({
        data: {
          success: false,
          message: "Social login is not enabled for Goynar Sur.",
        },
      }),
    }),
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/api/auth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistSession(dispatch, data, Boolean(arg.remember));
      },
    }),
    getUser: builder.query({
      query: () => "/api/auth/me",
      transformResponse: (response) => response.user,
    }),
    confirmEmail: builder.query({
      queryFn: async () => ({
        data: {
          success: true,
          message: "Email confirmation is handled by WordPress.",
        },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    confirmForgotPassword: builder.mutation({
      query: (data) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/api/account/profile",
        method: "PATCH",
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/api/account/profile",
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (!data?.user) return;

        const current = Cookies.get("userInfo");
        const accessToken = current ? JSON.parse(current)?.accessToken : undefined;
        persistSession(dispatch, {
          accessToken,
          user: data.user,
        });
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useConfirmEmailQuery,
  useResetPasswordMutation,
  useConfirmForgotPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useSignUpProviderMutation,
} = authApi;
