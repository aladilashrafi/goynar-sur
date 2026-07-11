import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import RegisterArea from '@/components/login-register/register-area';
import useRedirectAuthenticated from '@/hooks/use-redirect-authenticated';

const RegisterPage = () => {
  const isAuthenticated = useRedirectAuthenticated();
  if (isAuthenticated) return null;
  return (
    <Wrapper>
      <SEO pageTitle="Register" />
      <HeaderTwo style_2={true} />
      <main id="main-content" tabIndex="-1">
        <CommonBreadcrumb title="Register" subtitle="Account" center={true} />
        <RegisterArea />
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default RegisterPage;
