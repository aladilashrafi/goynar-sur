import React, { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";
import ErrorMsg from "@/components/common/error-msg";
import Footer from "@/layout/footers/footer";
import ShopFilterOffCanvas from "@/components/common/shop-filter-offcanvas";
import ShopLoader from "@/components/loader/shop/shop-loader";
import EmptyState from "@/components/common/empty-state";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetAllProductsQuery } from "@/redux/features/productApi";
import { useRouter } from "next/router";

const SORT_MAP = {
  "Default Sorting": {},
  "Low to High": { orderby: "price", order: "asc" },
  "High to Low": { orderby: "price", order: "desc" },
  "New Added": { orderby: "date", order: "desc" },
  "On Sale": { on_sale: "true" },
  Popularity: { orderby: "popularity", order: "desc" },
  Rating: { orderby: "rating", order: "desc" },
};

const ProductCategoryPage = ({ slug }) => {
  const router = useRouter();
  const routeQuery = router.query;
  const { data: categories, isLoading: isCategoryLoading, isError: isCategoryError } = useGetShowCategoryQuery();
  const category = categories?.result?.find((item) => item.slug === slug);
  const query = useMemo(() => {
    if (!category) return skipToken;
    const params = new URLSearchParams();
    params.set("per_page", "100");
    params.set("category", String(category.id));

    if (routeQuery.status === "on-sale") params.set("on_sale", "true");
    if (routeQuery.status === "in-stock") params.set("stock_status", "instock");
    if (routeQuery.featured === "true") params.set("featured", "true");
    if (routeQuery.min_price) params.set("min_price", routeQuery.min_price);
    if (routeQuery.max_price) params.set("max_price", routeQuery.max_price);
    if (routeQuery.attribute) params.set("attribute", routeQuery.attribute);
    if (routeQuery.attribute_term) params.set("attribute_term", routeQuery.attribute_term);
    if (routeQuery.attribute_relation) params.set("attribute_relation", routeQuery.attribute_relation);
    Object.entries(routeQuery).forEach(([key, value]) => {
      if (key.startsWith("attr_pa_") && value) {
        params.set(key, String(value));
      }
    });

    const sortParams = SORT_MAP[routeQuery.sort] || {};
    Object.entries(sortParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    return params.toString();
  }, [category, routeQuery]);
  const { data: products, isError, isLoading } = useGetAllProductsQuery(query);
  const [priceValue, setPriceValue] = useState([0, 0]);
  const [currPage, setCurrPage] = useState(1);

  const maxPrice = useMemo(() => {
    return (products?.data || []).reduce((max, product) => {
      return Number(product.price) > max ? Number(product.price) : max;
    }, 0);
  }, [products]);

  React.useEffect(() => {
    if (maxPrice) setPriceValue([0, maxPrice]);
  }, [maxPrice]);

  const handleChanges = (val) => {
    setCurrPage(1);
    setPriceValue(val);
  };

  const filteredProducts = products?.data || [];

  const applyPriceFilter = () => {
    const nextQuery = {
      ...router.query,
      min_price: String(priceValue[0] || 0),
      max_price: String(priceValue[1] || maxPrice || 0),
    };
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { scroll: false });
  };

  const selectHandleFilter = (e) => {
    setCurrPage(1);
    const nextQuery = { ...router.query };
    if (e.value === "Default Sorting") {
      delete nextQuery.sort;
    } else {
      nextQuery.sort = e.value;
    }
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { scroll: false });
  };

  const otherProps = {
    priceFilterValues: {
      priceValue,
      handleChanges,
      applyPriceFilter,
    },
    selectHandleFilter,
    currPage,
    setCurrPage,
  };

  let content = null;

  if (isCategoryLoading || isLoading) {
    content = <ShopLoader loading={true} />;
  } else if (isCategoryError || isError) {
    content = <ErrorMsg msg="This category is unavailable right now. Please try again soon." />;
  } else if (!category) {
    content = (
      <EmptyState
        title="Category not found"
        message="This jewellery category is unavailable or has moved."
        actionHref="/shop"
        actionLabel="Browse All Jewellery"
      />
    );
  } else if (!filteredProducts.length) {
    content = (
      <EmptyState
        title="No jewellery in this category yet"
        message="Please check back soon or browse the full collection."
        actionHref="/shop"
        actionLabel="Browse All Jewellery"
      />
    );
  } else {
    content = (
      <>
        <ShopArea all_products={products.data} products={filteredProducts} otherProps={otherProps} />
        <ShopFilterOffCanvas all_products={products.data} otherProps={otherProps} />
      </>
    );
  }

  return (
    <Wrapper>
      <div className="gs-shop-page-shell">
        <SEO pageTitle={category?.name || "Product Category"} />
        <HeaderTwo style_2={true} />
        <ShopBreadcrumb title={category?.name || "Product Category"} subtitle={category?.name || "Product Category"} />
        {content}
        <Footer primary_style={true} />
      </div>
    </Wrapper>
  );
};

export default ProductCategoryPage;

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (context) => {
  return {
    props: {
      slug: context.params?.slug || "",
    },
    revalidate: 600,
  };
};
