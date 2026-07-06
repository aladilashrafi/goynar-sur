import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderFour from '@/layout/headers/header-4';
import JewelryBanner from '@/components/banner/jewelry-banner';
import JewelryShopBanner from '@/components/shop-banner/jewelry-shop-banner';
import JewelryAbout from '@/components/about/jewelry-about';
import ProductArea from '@/components/products/jewelry/product-area';
import JewelryCollectionBanner from '@/components/shop-banner/jewelry-collection-banner';
import BestSellerPrd from '@/components/products/jewelry/best-seller-prd';
import JewelryBrands from '@/components/brand/jewelry-brands';
import InstagramAreaFour from '@/components/instagram/instagram-area-4';
import FeatureAreaThree from '@/components/features/feature-area-3';
import FooterTwo from '@/layout/footers/footer-2';

export default function Home() {
  return (
    <Wrapper>
      <SEO pageTitle='Handmade Jewellery in Bangladesh'/>
      <HeaderFour/>
      <main className="goynar-home">
        <JewelryBanner/>
        <FeatureAreaThree />
        <JewelryShopBanner/>
        <JewelryAbout/>
        <ProductArea/>
        <JewelryCollectionBanner/>
        <BestSellerPrd/>
        <JewelryBrands/>
        <InstagramAreaFour/>
      </main>
      <FooterTwo/>
    </Wrapper>
  )
}

//       <PopularProducts/> //* */
