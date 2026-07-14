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

const ProductDetailsPage = ({ query, initialProduct, productLoadFailed }) => {
  const { data: product, isLoading, isError } = useGetProductQuery(query.slug);
  const activeProduct = product || initialProduct;

  let content = null;

  if (isLoading && !initialProduct) {
    content = <PrdDetailsLoader loading={isLoading} />;
  }

  if (!isLoading && isError && !initialProduct) {
    content = <ErrorMsg msg="This product is unavailable right now. Please try again soon." />;
  }

  if (!isLoading && productLoadFailed && !activeProduct) {
    content = <ErrorMsg msg="This product is unavailable right now. Please try again soon." />;
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

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (context) => {
  const query = { slug: context.params?.slug || "" };
  let initialProduct = null;
  let productLoadFailed = false;

  try {
    const product = await getProductBySlug(query.slug);
    if (!product) {
      return { notFound: true };
    }
    initialProduct = mapWooProduct(product);
  } catch (error) {
    productLoadFailed = true;
  }

  return {
    props: {
      query,
      initialProduct,
      productLoadFailed,
    },
    revalidate: 300,
  };
};
