import { apiSlice } from "@/redux/api/apiSlice";

const phaseOneAuthResponse = {
  success: false,
  message: "Customer accounts are disabled in Phase 1. Please use guest checkout.",
};

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    signUpProvider: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    loginUser: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    getUser: builder.query({
      queryFn: async () => ({ data: null }),
    }),
    confirmEmail: builder.query({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    resetPassword: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    confirmForgotPassword: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    changePassword: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
    }),
    updateProfile: builder.mutation({
      queryFn: async () => ({ data: phaseOneAuthResponse }),
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
