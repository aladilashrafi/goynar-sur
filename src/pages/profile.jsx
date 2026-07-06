import React from "react";
// internal
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import PhaseOneDisabled from "@/components/common/phase-one-disabled";

const ProfilePage = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Account" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Account" subtitle="Phase 2" center={true} />
      <PhaseOneDisabled
        title="Customer accounts are coming in Phase 2"
        message="Phase 1 keeps checkout simple: browse products, add to cart, and place a guest Cash on Delivery order."
        primaryLabel="Continue Shopping"
        primaryHref="/shop"
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ProfilePage;
