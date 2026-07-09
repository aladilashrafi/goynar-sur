import SEO from "@/components/seo";
import dynamic from "next/dynamic";
import Wrapper from "@/layout/wrapper";
import HeaderFour from '@/layout/headers/header-4';
import JewelryBanner from '@/components/banner/jewelry-banner';
import FeatureAreaThree from '@/components/features/feature-area-3';
import FooterTwo from '@/layout/footers/footer-2';
import LazySection from "@/components/common/lazy-section";

const JewelryShopBanner = dynamic(() => import("@/components/shop-banner/jewelry-shop-banner"));
const JewelryAbout = dynamic(() => import("@/components/about/jewelry-about"));
const ProductArea = dynamic(() => import("@/components/products/jewelry/product-area"));
const JewelryCollectionBanner = dynamic(() => import("@/components/shop-banner/jewelry-collection-banner"));
const BestSellerPrd = dynamic(() => import("@/components/products/jewelry/best-seller-prd"));
const JewelryBrands = dynamic(() => import("@/components/brand/jewelry-brands"));
const InstagramAreaFour = dynamic(() => import("@/components/instagram/instagram-area-4"));

export default function Home() {
  return (
    <Wrapper>
      <SEO pageTitle='Handmade Jewellery in Bangladesh'/>
      <HeaderFour/>
      <main className="goynar-home">
        <JewelryBanner/>
        <FeatureAreaThree />
        <LazySection minHeight={580}>
          <JewelryShopBanner/>
        </LazySection>
        <LazySection minHeight={520}>
          <JewelryAbout/>
        </LazySection>
        <LazySection minHeight={760}>
          <ProductArea/>
        </LazySection>
        <LazySection minHeight={680}>
          <JewelryCollectionBanner/>
        </LazySection>
        <LazySection minHeight={520}>
          <BestSellerPrd/>
        </LazySection>
        <LazySection minHeight={180}>
          <JewelryBrands/>
        </LazySection>
        <LazySection minHeight={320}>
          <InstagramAreaFour/>
        </LazySection>
      </main>
      <FooterTwo/>
    </Wrapper>
  )
}

//       <PopularProducts/> //* */
