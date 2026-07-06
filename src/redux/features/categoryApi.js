import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      queryFn: async () => ({ data: { success: false, message: "Categories are managed in WordPress." } }),
    }),
    getShowCategory: builder.query({
      query: () => `/api/categories`,
      transformResponse: (response) => ({ result: response.categories || [] }),
    }),
    getProductTypeCategory: builder.query({
      query: () => `/api/categories`,
      transformResponse: (response) => ({ result: response.categories || [] }),
    }),
  }),
});

export const {
 useAddCategoryMutation,
 useGetProductTypeCategoryQuery,
 useGetShowCategoryQuery,
} = categoryApi;
