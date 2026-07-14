import { apiSlice } from "../api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: (query) => {
        const search = new URLSearchParams(query || "");
        if (!search.has("per_page")) {
          search.set("per_page", "100");
        }
        return `/api/products?${search.toString()}`;
      },
      transformResponse: (response) => ({ data: response.products || [], count: response.count || 0 }),
      providesTags:['Products']
    }),
    getProductType: builder.query({
      query: ({ type, query }) => {
        const search = new URLSearchParams(query || "");
        if (type && type !== "all" && Number.isFinite(Number(type))) {
          search.set("category", type);
        }
        return `/api/products?${search.toString()}`;
      },
      transformResponse: (response) => ({ data: response.products || [], count: response.count || 0 }),
      providesTags:['ProductType']
    }),
    getOfferProducts: builder.query({
      query: () => `/api/products?per_page=8&on_sale=true`,
      transformResponse: (response) => ({ data: response.products || [] }),
      providesTags:['OfferProducts']
    }),
    getPopularProductByType: builder.query({
      query: () => `/api/products?per_page=8&orderby=popularity`,
      transformResponse: (response) => ({ data: response.products || [] }),
      providesTags:['PopularProducts']
    }),
    getTopRatedProducts: builder.query({
      query: () => `/api/products?per_page=8&orderby=rating`,
      transformResponse: (response) => ({ data: response.products || [] }),
      providesTags:['TopRatedProducts']
    }),
    // get single product
    getProduct: builder.query({
      query: (id) => `/api/products/${id}`,
      transformResponse: (response) => response.product,
      providesTags: (result, error, arg) => [{ type: "Product", id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: "RelatedProducts", id:arg },
      ],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: (id) => `/api/products/related/${id}`,
      transformResponse: (response) => ({ data: response.products || [] }),
      providesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg },
      ],
    }),
    getProductVariations: builder.query({
      query: (id) => `/api/products/variations?productId=${id}`,
      transformResponse: (response) => ({
        variations: response.variations || [],
        attributeTermSlugs: response.attributeTermSlugs || {},
      }),
      providesTags: (result, error, arg) => [{ type: "Product", id: `${arg}-variations` }],
    }),
    getProductFilters: builder.query({
      query: () => "/api/products/filters",
      transformResponse: (response) => response.filters || { categories: [], attributes: [], statuses: [] },
      providesTags: ["ProductFilters"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductTypeQuery,
  useGetOfferProductsQuery,
  useGetPopularProductByTypeQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetProductVariationsQuery,
  useGetProductFiltersQuery,
} = productApi;
