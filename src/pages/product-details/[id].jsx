import React, { useEffect } from 'react';
// internal
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import ErrorMsg from '@/components/common/error-msg';
import { useGetProductQuery } from '@/redux/features/productApi';
import ProductDetailsBreadcrumb from '@/components/breadcrumb/product-details-breadcrumb';
import ProductDetailsArea from '@/components/product-details/product-details-area';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import { useRouter } from 'next/router';
import { productUrl } from '@/utils/routes';
import { getProductById, getProductBySlug } from '@/lib/woocommerce';
import { mapWooProduct } from '@/utils/mapWooProduct';
import {
  productBreadcrumbSchema,
  productCanonicalPath,
  productSchema,
  productSeoDescription,
} from '@/utils/seo';

const ProductDetailsPage = ({ query, initialProduct, productLoadFailed }) => {
  const router = useRouter();
  const { data: product, isLoading, isError } = useGetProductQuery(query.id);
  const activeProduct = product || initialProduct;

  useEffect(() => {
    if (activeProduct?.slug) {
      router.replace(productUrl(activeProduct));
    }
  }, [activeProduct, router]);

  // decide what to render
  let content = null;
  if (isLoading && !initialProduct) {
    content = <PrdDetailsLoader loading={isLoading}/>;
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
        canonicalPath={activeProduct ? productCanonicalPath(activeProduct) : `/product-details/${query.id}`}
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
  let productLoadFailed = false;

  try {
    const identifier = String(query.id || "");
    const product = /^\d+$/.test(identifier)
      ? await getProductById(identifier)
      : await getProductBySlug(identifier);
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
  };
};
