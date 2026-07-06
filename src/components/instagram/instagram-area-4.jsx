import React from 'react';
import Image from 'next/image';
// internal
import insta_1 from '@assets/img/goynar-home/blue-ring-portrait.jpg';
import insta_2 from '@assets/img/goynar-home/blue-ring-close.jpg';
import insta_3 from '@assets/img/goynar-home/colorful-bangles-wide.jpg';
import insta_4 from '@assets/img/goynar-home/red-bangle-detail.jpg';
import insta_5 from '@assets/img/goynar-home/red-festival-backdrop.jpg';
import insta_6 from '@assets/img/goynar-home/red-flower-lake.jpg';

// instagram data 
const instagram_data = [
  { id: 1, link: 'https://www.instagram.com/', img: insta_1 },
  { id: 2, link: 'https://www.instagram.com/', img: insta_2 },
  { id: 3, link: 'https://www.instagram.com/', img: insta_3 },
  { id: 4, link: 'https://www.instagram.com/', img: insta_4 },
  { id: 5, link: 'https://www.instagram.com/', img: insta_5 },
  { id: 6, link: 'https://www.instagram.com/', img: insta_6 },
]

const InstagramAreaFour = () => {
  return (
    <>
      <section className="tp-instagram-area tp-instagram-style-4 pt-110 pb-10">
        <div className="container-fluid pl-20 pr-20">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-4 mb-50 text-center">
                <h3 className="tp-section-title-4">Styled by Goynar Sur</h3>
                <p>Colourful handmade jewellery inspiration for daily wear, gifts, and celebrations.</p>
              </div>
            </div>
          </div>
          <div className="row row-cols-lg-6 row-cols-sm-2 row-cols-1 gx-2 gy-2 gy-lg-0">
            {instagram_data.map((item, i) => (
              <div className="col" key={i}>
                <div className="tp-instagram-item-2 w-img">
                  <Image src={item.img} alt="Goynar Sur handmade jewellery inspiration" sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 17vw" />
                  <div className="tp-instagram-icon-2">
                    <a href={item.link} target="_blank" className="popup-image">
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default InstagramAreaFour;
