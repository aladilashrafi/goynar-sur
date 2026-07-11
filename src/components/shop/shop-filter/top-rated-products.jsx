import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// internal
import ErrorMsg from '@/components/common/error-msg';
import { useGetTopRatedProductsQuery } from '@/redux/features/productApi';
import ShopTopRatedLoader from '@/components/loader/shop/top-rated-prd-loader';
import { productUrl } from '@/utils/routes';
import ProductRating from '@/components/common/product-rating';
import SalePrice from '@/components/common/sale-price';

const TopRatedProducts = () => {
  const { data: products, isError, isLoading } = useGetTopRatedProductsQuery();
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <ShopTopRatedLoader loading={isLoading}/>
    );
  }
  else if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  else if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  else if (!isLoading && !isError && products?.data?.length > 0) {
    const product_items = products.data.slice(0, 3);
    content = product_items.map((item) => (
      <div key={item._id} className="tp-shop-widget-product-item d-flex align-items-center">
        <div className="tp-shop-widget-product-thumb">
          <Link href={productUrl(item)}>
            <Image src={item.img} alt="product img" width={70} height={70} />
          </Link>
        </div>
        <div className="tp-shop-widget-product-content">
          <ProductRating
            averageRating={item.averageRating}
            ratingCount={item.ratingCount}
            className="tp-shop-widget-product-rating-wrapper"
          />
          <h4 className="tp-shop-widget-product-title">
            <Link href={productUrl(item)}>{item.title.substring(0,20)}...</Link>
          </h4>
          <div className="tp-shop-widget-product-price-wrapper">
            <SalePrice
              price={item.price}
              regularPrice={item.regularPrice}
              className="gs-sale-price--compact"
              currentPriceClassName="tp-shop-widget-product-price"
            />
          </div>
        </div>
      </div>
    ))
  }
  return (
    <>
      <div className="tp-shop-widget mb-50">
        <h3 className="tp-shop-widget-title">Top Rated Products</h3>
        <div className="tp-shop-widget-content">
          <div className="tp-shop-widget-product">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopRatedProducts;
