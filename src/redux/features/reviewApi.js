import { apiSlice } from "../api/apiSlice";

export const reviewApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    addReview: builder.mutation({
      queryFn: async () => ({
        data: {
          success: false,
          message: "Reviews are disabled in Phase 1.",
        },
      }),
      invalidatesTags: (result, error, arg) => ["Products",{ type: "Product", id: arg?.productId }],
    }),
  }),
});

export const {useAddReviewMutation} = reviewApi;
