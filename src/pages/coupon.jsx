import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import PhaseOneDisabled from '@/components/common/phase-one-disabled';

const CouponPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Coupon" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Offers" subtitle="Coupon" />
      <PhaseOneDisabled
        title="Coupons are not active in Phase 1"
        message="Checkout is currently Cash on Delivery only with no coupon requirement. Offers and coupon support are planned for Phase 2."
        primaryLabel="Shop Products"
        primaryHref="/shop"
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default CouponPage;
