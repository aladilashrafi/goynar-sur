import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import PhaseOneDisabled from '@/components/common/phase-one-disabled';

const RegisterPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Login" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Guest Checkout" subtitle="Account" center={true} />
      <PhaseOneDisabled
        title="Accounts are coming soon"
        message="Registration is not part of Phase 1. Please continue as a guest and place your order with Cash on Delivery."
        primaryLabel="Start Shopping"
        primaryHref="/shop"
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default RegisterPage;
