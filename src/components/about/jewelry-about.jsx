import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// internal
import about_img from '@assets/img/goynar-home/red-festival-backdrop.jpg';
import about_thumb from '@assets/img/goynar-home/blue-ring-close.jpg';
import { ArrowRightLong } from '@/svg';

const JewelryAbout = () => {
  return (
    <>
      <section className="tp-about-area pt-125 pb-180">
        <div className="container">
          <div className="row">
            <div className="col-xl-5 col-lg-6">
              <div className="tp-about-thumb-wrapper p-relative mr-35">
                <div className="tp-about-thumb m-img">
                  <Image src={about_img} alt="Goynar Sur festive handmade jewellery styling" sizes="(max-width: 991px) 92vw, 520px" />
                </div>
                <div className="tp-about-thumb-2">
                  <Image src={about_thumb} alt="Blue ring and bracelet details from Goynar Sur" sizes="(max-width: 991px) 42vw, 260px" />
                </div>
              </div>
            </div>
            <div className="col-xl-7 col-lg-6">
              <div className="tp-about-wrapper pl-80 pt-75 pr-60">
                <div className="tp-section-title-wrapper-4 mb-50">
                  <span className="tp-section-title-pre-4">Our Craft</span>
                  <h3 className="tp-section-title-4 fz-50">Handmade jewellery shaped for Bangladeshi celebrations</h3>
                </div>
                <div className="tp-about-content pl-120">
                  <p>Goynar Sur brings together pearl, beads, kundan, stones, and gold-plated details in pieces that feel personal, giftable, and easy to wear. Browse the collection, place your order as a guest, and pay safely with Cash on Delivery anywhere in Bangladesh.</p>

                  <div className="tp-about-btn">
                    <Link href="/contact" className="tp-btn">
                      Talk To Us{" "}<ArrowRightLong />
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

export default JewelryAbout;
