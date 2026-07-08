import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// internal
import ErrorMsg from '../common/error-msg';
import { useGetProductTypeCategoryQuery } from '@/redux/features/categoryApi';
import HomeCateLoader from '../loader/home/home-cate-loader';

const ElectronicCategory = () => {
  const { data: categories, isLoading, isError } = useGetProductTypeCategoryQuery('electronics');
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <HomeCateLoader loading={isLoading} />
    );
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    const category_items = categories.result;
    content = category_items.map((item) => (
      <div className="col" key={item._id}>
        <div className="tp-product-category-item text-center mb-40">
          <div className="tp-product-category-thumb fix">
            <Link href={`/product-category/${item.slug}`}>
              <Image src={item.img} alt="product-category" width={76} height={98} />
            </Link>
          </div>
          <div className="tp-product-category-content">
            <h3 className="tp-product-category-title">
              <Link href={`/product-category/${item.slug}`}>{item.name}</Link>
            </h3>
            <p>{item.count} Product</p>
          </div>
        </div>
      </div>
    ))
  }
  return (
    <section className="tp-product-category pt-60 pb-15">
      <div className="container">
        <div className="row row-cols-xl-5 row-cols-lg-5 row-cols-md-4">
          {content}
        </div>
      </div>
    </section>
  );
};

export default ElectronicCategory;
