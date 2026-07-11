import React, { useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
// internal
import slider_img_1 from '@assets/img/goynar-home/blue-ring-close.jpg';
import slider_img_2 from '@assets/img/goynar-home/blue-ring-portrait.jpg';
import slider_img_3 from '@assets/img/goynar-home/bangles-product-square.jpg';
import slider_img_4 from '@assets/img/goynar-home/red-festival-backdrop.jpg';
// nav icon
import nav_icon_1 from '@assets/img/slider/4/nav/icon-1.png';
import nav_icon_2 from '@assets/img/slider/4/nav/icon-2.png';
import nav_icon_3 from '@assets/img/slider/4/nav/icon-3.png';
import nav_icon_4 from '@assets/img/slider/4/nav/icon-4.png';
import { ArrowNextTwo, ArrowPrevTwo } from '@/svg';
import Link from 'next/link';

// slider data 
const slider_data = [
  { subtitle: 'Handcrafted in Bangladesh', title: 'Jewellery with a soulful rhythm', img: slider_img_1, alt: 'Blue handmade ring and bracelet set' },
  { subtitle: 'Goynar Sur signature', title: 'Pearl, beads & festive colour', img: slider_img_2, alt: 'Close view of blue handmade ring and bracelet' },
  { subtitle: 'Cash on Delivery', title: 'Premium gift-ready pieces', img: slider_img_3, alt: 'Colorful handmade bangle set on fabric' },
  { subtitle: 'Daily to bridal', title: 'Crafted sets for every occasion', img: slider_img_4, alt: 'Red festive handmade bangle styling' },
]

// slider nav data
const slider_nav_data = [
  { icon: nav_icon_1, title: <>Casual</> },
  { icon: nav_icon_2, title: <>Occassional</> },
  { icon: nav_icon_3, title: <>Premium</> },
  { icon: nav_icon_4, title: <>Festival</> },
] 

const JewelryBanner = () => {
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);

  //  slider setting 
  const main_slider_setting = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    centerMode: false,
  }
  // nav slider setting 
  const nav_slider_setting = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    dots: false,
    arrows: false,
    centerMode: false,
    focusOnSelect: true,
  }

  return (
    <>
      <section className="tp-slider-area p-relative z-index-1 fix">
        <Slider {...main_slider_setting} asNavFor={slider2} ref={(slider) => setSlider1(slider)} className="tp-slider-active-4 khaki-bg">
          {slider_data.map((item, i) => (
            <div key={i} className="tp-slider-item-4 tp-slider-height-4 p-relative khaki-bg d-flex align-items-center" >
              <div className="tp-slider-thumb-4">
                <Image src={item.img} alt={item.alt} priority sizes="(max-width: 767px) 92vw, (max-width: 1199px) 48vw, 560px" />
                <div className="tp-slider-thumb-4-shape">
                  <span className="tp-slider-thumb-4-shape-1"></span>
                  <span className="tp-slider-thumb-4-shape-2"></span>
                </div>
              </div>

              <div className="container">
                <div className="row align-items-center">
                  <div className="col-xl-6 col-lg-6 col-md-8">
                    <div className="tp-slider-content-4 p-relative z-index-1">
                      <span>{item.subtitle}</span>
                      <h2 className="tp-slider-title-4">{item.title}</h2>
                      <div className="tp-slider-btn-4">
                        <Link href="/shop" className="tp-btn tp-btn-border tp-btn-border-white">Shop Goynar Sur</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>

        {/* arrow start */}
        <div className="tp-slider-arrow-4">
          <button className="tp-slider-3-button-prev slick-arrow" onClick={() => slider1?.slickPrev()}>
            <ArrowPrevTwo/>
          </button>
          <button className="tp-slider-3-button-next slick-arrow" onClick={() => slider1?.slickNext()}>
            <ArrowNextTwo/>
          </button>
          </div>
        {/* arrow end */}

        <div className="tp-slider-nav">

          <Slider {...nav_slider_setting} asNavFor={slider1} ref={(slider) => setSlider2(slider)} className="tp-slider-nav-active">
            {slider_nav_data.map((item, i) => (
              <div key={i} className="tp-slider-nav-item d-flex align-items-center">
                <div className="tp-slider-nav-icon">
                  <span>
                    <Image src={item.icon} alt="icon" />
                  </span>
                </div>
                <div className="tp-slider-nav-content">
                  <h5 className="tp-slider-nav-title">{item.title}</h5>
                </div>
              </div>
            ))}
          </Slider>

        </div>
      </section>
    </>
  );
};

export default JewelryBanner;
