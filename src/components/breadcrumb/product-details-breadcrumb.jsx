import React from 'react';
import Link from 'next/link';
import { SmDot } from '@/svg';

const ProductDetailsBreadcrumb = ({category,title,categorySlug}) => {
  return (
    <section className="breadcrumb__area breadcrumb__style-2 include-bg pt-50 pb-20">
    <div className="container">
       <div className="row">
          <div className="col-xxl-12">
             <div className="breadcrumb__content p-relative z-index-1">
                <div className="breadcrumb__list has-icon">
                   <span className="breadcrumb-icon">
                      <SmDot/>{" "}
                   </span>
                   <span><Link href="/">Home</Link></span>
                   <span><Link href={categorySlug ? `/product-category/${categorySlug}` : "/shop"}>{category}</Link></span>
                   <span>{title}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
 </section>
  );
};

export default ProductDetailsBreadcrumb;
