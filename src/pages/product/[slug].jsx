import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import ErrorMsg from "@/components/common/error-msg";
import { useGetProductQuery } from "@/redux/features/productApi";
import ProductDetailsBreadcrumb from "@/components/breadcrumb/product-details-breadcrumb";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import PrdDetailsLoader from "@/components/loader/prd-details-loader";
import { getProductBySlug } from "@/lib/woocommerce";
import { mapWooProduct } from "@/utils/mapWooProduct";
import {
  productBreadcrumbSchema,
  productCanonicalPath,
  productSchema,
  productSeoDescription,
} from "@/utils/seo";

const ProductDetailsPage = ({ query, initialProduct }) => {
  const { data: product, isLoading, isError } = useGetProductQuery(query.slug);
  const activeProduct = product || initialProduct;

  let content = null;

  if (isLoading && !initialProduct) {
    content = <PrdDetailsLoader loading={isLoading} />;
  }

  if (!isLoading && isError && !initialProduct) {
    content = <ErrorMsg msg="There was an error" />;
  }

  if (activeProduct) {
    content = (
      <>
        <ProductDetailsBreadcrumb category={activeProduct.category.name} title={activeProduct.title} categorySlug={activeProduct.category.slug} />
        <ProductDetailsArea productItem={activeProduct} />
      </>
    );
  }

  return (
    <Wrapper>
      <SEO
        pageTitle={activeProduct?.title || "Product Details"}
        description={activeProduct ? productSeoDescription(activeProduct) : undefined}
        canonicalPath={activeProduct ? productCanonicalPath(activeProduct) : `/product/${query.slug}`}
        ogImage={activeProduct?.img}
        ogType="product"
        jsonLd={activeProduct ? [productSchema(activeProduct), productBreadcrumbSchema(activeProduct)] : []}
      />
      <HeaderTwo style_2={true} />
      {content}
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ProductDetailsPage;

export const getServerSideProps = async (context) => {
  const { query } = context;
  let initialProduct = null;

  try {
    const product = await getProductBySlug(query.slug);
    initialProduct = product ? mapWooProduct(product) : null;
  } catch (error) {
    initialProduct = null;
  }

  return {
    props: {
      query,
      initialProduct,
    },
  };
};
