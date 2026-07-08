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
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetAllProductsQuery } from "@/redux/features/productApi";

const ProductCategoryPage = ({ slug }) => {
  const { data: categories, isLoading: isCategoryLoading, isError: isCategoryError } = useGetShowCategoryQuery();
  const category = categories?.result?.find((item) => item.slug === slug);
  const query = category ? `per_page=100&category=${category.id}` : skipToken;
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

  const filteredProducts = (products?.data || []).filter((product) => {
    if (!maxPrice) return true;
    return Number(product.price) >= priceValue[0] && Number(product.price) <= priceValue[1];
  });

  const otherProps = {
    priceFilterValues: {
      priceValue,
      handleChanges,
      applyPriceFilter: () => {},
    },
    selectHandleFilter: () => {},
    currPage,
    setCurrPage,
  };

  let content = null;

  if (isCategoryLoading || isLoading) {
    content = <ShopLoader loading={true} />;
  } else if (isCategoryError || isError) {
    content = <ErrorMsg msg="There was an error" />;
  } else if (!category) {
    content = <ErrorMsg msg="Category not found" />;
  } else if (!filteredProducts.length) {
    content = <ErrorMsg msg="No products found in this category." />;
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
      <SEO pageTitle={category?.name || "Product Category"} />
      <HeaderTwo style_2={true} />
      <ShopBreadcrumb title={category?.name || "Product Category"} subtitle={category?.name || "Product Category"} />
      {content}
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ProductCategoryPage;

export const getServerSideProps = async (context) => {
  return {
    props: {
      slug: context.params?.slug || "",
    },
  };
};
