import React from 'react';
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import Footer from '@/layout/footers/footer';
import ForgotArea from '@/components/login-register/forgot-area';
import useRedirectAuthenticated from '@/hooks/use-redirect-authenticated';

const ForgotPage = () => {
  const isAuthenticated = useRedirectAuthenticated();
  if (isAuthenticated) return null;
  return (
    <Wrapper>
      <SEO pageTitle="Account Recovery" />
      <HeaderTwo style_2={true} />
      <main id="main-content" tabIndex="-1">
        <CommonBreadcrumb title="Account Recovery" subtitle="Account" center={true} />
        <ForgotArea />
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ForgotPage;
