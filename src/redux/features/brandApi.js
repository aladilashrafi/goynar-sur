import { apiSlice } from "../api/apiSlice";

export const brandApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    getActiveBrands: builder.query({
      queryFn: async () => ({ data: [] }),
    }),
  }),
});

export const {
 useGetActiveBrandsQuery
} = brandApi;
