import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import PhaseOneDisabled from '@/components/common/phase-one-disabled';

const LoginPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Login" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Guest Checkout" subtitle="Account" center={true} />
      <PhaseOneDisabled
        title="Guest checkout is ready"
        message="Customer accounts are planned for Phase 2. For now, you can shop and place Cash on Delivery orders without signing in."
        primaryLabel="Go to Checkout"
        primaryHref="/checkout"
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default LoginPage;
