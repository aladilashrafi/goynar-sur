import React from 'react';
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import Footer from '@/layout/footers/footer';
import ForgotArea from '@/components/login-register/forgot-area';

const ForgotPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Account Recovery" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Account Recovery" subtitle="Account" center={true} />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ForgotPage;
