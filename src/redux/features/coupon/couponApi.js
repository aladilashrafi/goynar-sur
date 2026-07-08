import { apiSlice } from "@/redux/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: "/api/coupons/validate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),
    // get offer coupon
    getOfferCoupons: builder.query({
      queryFn: async () => ({ data: [] }),
      providesTags:['Coupon'],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const { useGetOfferCouponsQuery, useValidateCouponMutation } = authApi;
