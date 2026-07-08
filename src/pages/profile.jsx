import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
// internal
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import ProfileArea from "@/components/my-account/profile-area";

const ProfilePage = () => {
  const router = useRouter();
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const hasStoredSession = Boolean(Cookies.get("userInfo"));
    if (!accessToken && !hasStoredSession) {
      router.replace("/login?redirect=/profile");
    }
  }, [accessToken, router]);

  return (
    <Wrapper>
      <SEO pageTitle="Account" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="My Account" subtitle="Account" center={true} />
      {accessToken && <ProfileArea />}
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ProfilePage;
