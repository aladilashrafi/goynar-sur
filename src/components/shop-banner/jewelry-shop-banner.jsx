import React from 'react';
import Link from 'next/link';
// internal
import { ArrowRightLong } from '@/svg';
import banner_bg_1 from '@assets/img/goynar-home/colorful-bangles-wide.jpg';
import banner_bg_2 from '@assets/img/goynar-home/red-bangle-detail.jpg';
import banner_bg_3 from '@assets/img/goynar-home/red-flower-lake.jpg';
import banner_bg_4 from '@assets/img/goynar-home/bangles-product-square.jpg';

// BannerItem
function BannerItem({ cls, bg_clr, bg, content, title, isBtn=false, bgPosition="center" }) {
  return (
    <div className={`tp-banner-item-4 tp-banner-height-4 fix p-relative z-index-1 ${cls}`} 
    data-bg-color={`#${bg_clr}`}>
      <div className="tp-banner-thumb-4 include-bg black-bg transition-3" 
      style={{backgroundImage:`url(${bg.src})`, backgroundPosition: bgPosition}}></div>
      <div className="tp-banner-content-4">
        <span>{content}</span>
        <h3 className="tp-banner-title-4">
          <Link href="/shop">{title}</Link>
        </h3>
        {isBtn && <div className="tp-banner-btn-4">
          <Link href="/shop" className="tp-btn tp-btn-border">
            Shop Now {" "} <ArrowRightLong/>
          </Link>
        </div>}
      </div>
    </div>
  )
}

const JewelryShopBanner = () => {
  return (
    <>
      <section className="tp-banner-area">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-7">
              <div className="row">
                <div className="col-xl-12">
                  <BannerItem cls="mb-25" bg_clr="E1CCD3" bg={banner_bg_1} content="Signature Edit"
                  title={<>Pearl & bead pieces <br /> for everyday glow</>} isBtn={true} bgPosition="center 58%" />
                </div>
                <div className="col-md-6 col-sm-6">
                <BannerItem cls="has-green sm-banner" bg_clr="EAF3F4" bg={banner_bg_2} content="Trending" title="Colourful Sets" bgPosition="center 40%" />
  
                </div>
                <div className="col-md-6 col-sm-6">
                <BannerItem cls="has-brown sm-banner" bg_clr="F5E9EE" bg={banner_bg_3} content="New Arrival" title="Festive Wear" bgPosition="left center" />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-5">
              <div className="tp-banner-full tp-banner-full-height fix p-relative z-index-1">
                <div className="tp-banner-full-thumb include-bg black-bg transition-3" 
                style={{backgroundImage:`url(${banner_bg_4.src})`, backgroundPosition:"center 54%"}}></div>
                <div className="tp-banner-full-content">
                  <span>Bridal Collection</span>
                  <h3 className="tp-banner-full-title">
                    <Link href="/shop">Statement sets <br /> for special days</Link>
                  </h3>
                  <div className="tp-banner-full-btn">
                    <Link href="/shop" className="tp-btn tp-btn-border">
                      Shop Now{" "}<ArrowRightLong/>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default JewelryShopBanner;
