import React from 'react';
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import Footer from '@/layout/footers/footer';
import PhaseOneDisabled from '@/components/common/phase-one-disabled';

const ForgotPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Account Recovery" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Account Recovery" subtitle="Account" center={true} />
      <PhaseOneDisabled
        title="Password recovery is not active yet"
        message="Customer accounts arrive in Phase 2. Phase 1 checkout works without an account."
        primaryLabel="Go to Checkout"
        primaryHref="/checkout"
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ForgotPage;
