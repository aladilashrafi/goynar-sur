import { apiSlice } from "../api/apiSlice";

export const reviewApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: (productId) => `/api/products/reviews?productId=${productId}`,
      transformResponse: (response) => ({
        reviews: response.reviews || [],
        count: response.count || 0,
      }),
      providesTags: (result, error, arg) => [{ type: "ProductReviews", id: arg }],
    }),
    addReview: builder.mutation({
      query: (data) => ({
        url: "/api/products/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        "Products",
        { type: "Product", id: arg?.productId },
        { type: "ProductReviews", id: arg?.productId },
      ],
    }),
  }),
});

export const { useAddReviewMutation, useGetProductReviewsQuery } = reviewApi;
