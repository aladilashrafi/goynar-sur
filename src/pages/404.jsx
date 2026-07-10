import EmptyState from "@/components/common/empty-state";
import SEO from "@/components/seo";
import Footer from "@/layout/footers/footer";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import React from "react";

export default function NotFoundPage() {
  return (
    <Wrapper>
      <SEO pageTitle="Page Not Found" />
      <HeaderTwo style_2={true} />
      <EmptyState
        title="Page not found"
        message="The page or product you are looking for is unavailable."
        actionHref="/shop"
        actionLabel="Browse Jewellery"
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
