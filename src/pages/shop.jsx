import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";
import { useGetAllProductsQuery } from "@/redux/features/productApi";
import ErrorMsg from "@/components/common/error-msg";
import Footer from "@/layout/footers/footer";
import ShopFilterOffCanvas from "@/components/common/shop-filter-offcanvas";
import ShopLoader from "@/components/loader/shop/shop-loader";
import EmptyState from "@/components/common/empty-state";

const SORT_MAP = {
  "Default Sorting": {},
  "Low to High": { orderby: "price", order: "asc" },
  "High to Low": { orderby: "price", order: "desc" },
  "New Added": { orderby: "date", order: "desc" },
  "On Sale": { on_sale: "true" },
  Popularity: { orderby: "popularity", order: "desc" },
  Rating: { orderby: "rating", order: "desc" },
};

const ShopPage = ({ query }) => {
  const router = useRouter();
  const [priceValue, setPriceValue] = useState([Number(query.min_price || 0), Number(query.max_price || 0)]);
  const [currPage, setCurrPage] = useState(1);

  const productQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "100");

    if (query.category && Number.isFinite(Number(query.category))) {
      params.set("category", query.category);
    }

    if (query.status === "on-sale") {
      params.set("on_sale", "true");
    }

    if (query.status === "in-stock") {
      params.set("stock_status", "instock");
    }

    if (query.featured === "true") {
      params.set("featured", "true");
    }

    if (query.min_price) params.set("min_price", query.min_price);
    if (query.max_price) params.set("max_price", query.max_price);

    const sortParams = SORT_MAP[query.sort] || {};
    Object.entries(sortParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    return params.toString();
  }, [query]);

  const { data: products, isError, isLoading } = useGetAllProductsQuery(productQuery);

  useEffect(() => {
    if (!isLoading && !isError && products?.data?.length > 0 && !query.max_price) {
      const maxPrice = products.data.reduce((max, product) => {
        return Number(product.price) > max ? Number(product.price) : max;
      }, 0);
      setPriceValue([Number(query.min_price || 0), maxPrice]);
    }
  }, [isLoading, isError, products, query.max_price, query.min_price]);

  const handleChanges = (val) => {
    setCurrPage(1);
    setPriceValue(val);
  };

  const selectHandleFilter = (e) => {
    setCurrPage(1);
    const nextQuery = { ...router.query };
    if (e.value === "Default Sorting") {
      delete nextQuery.sort;
    } else {
      nextQuery.sort = e.value;
    }
    router.push({ pathname: "/shop", query: nextQuery }, undefined, { scroll: false });
  };

  const applyPriceFilter = () => {
    const nextQuery = {
      ...router.query,
      min_price: String(priceValue[0] || 0),
      max_price: String(priceValue[1] || 0),
    };
    router.push({ pathname: "/shop", query: nextQuery }, undefined, { scroll: false });
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

  if (isLoading) {
    content = <ShopLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = (
      <div className="pb-80 text-center">
        <ErrorMsg msg="Products are unavailable right now. Please refresh or try again soon." />
      </div>
    );
  }

  if (!isLoading && !isError && products?.data?.length === 0) {
    content = (
      <EmptyState
        title="No jewellery found"
        message="Try a different category, remove filters, or contact us for a custom handmade piece."
        actionHref="/shop"
        actionLabel="Reset Shop"
      />
    );
  }

  if (!isLoading && !isError && products?.data?.length > 0) {
    content = (
      <>
        <ShopArea all_products={products.data} products={products.data} otherProps={otherProps} />
        <ShopFilterOffCanvas all_products={products.data} otherProps={otherProps} />
      </>
    );
  }

  return (
    <Wrapper>
      <SEO pageTitle="Shop" />
      <HeaderTwo style_2={true} />
      <ShopBreadcrumb title="Shop" subtitle="Shop" />
      {content}
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ShopPage;

export const getServerSideProps = async (context) => {
  const { query } = context;

  return {
    props: {
      query,
    },
  };
};
