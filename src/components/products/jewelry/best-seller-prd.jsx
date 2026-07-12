import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// internal
import ProductItem from './product-item';
import ErrorMsg from '@/components/common/error-msg';
import { useGetProductTypeQuery } from '@/redux/features/productApi';
import HomeTwoBestSellPrdPrdLoader from '@/components/loader/home-2/home-2-bestSell-loader';

// slider setting
const slider_setting = {
    slidesPerView: 4,
		spaceBetween: 24,
		breakpoints: {
			'1200': {
				slidesPerView: 4,
			},
			'992': {
				slidesPerView: 3,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 2,
			},
			'0': {
				slidesPerView: 1,
			},
		}
}

const BestSellerPrd = () => {
  const { data: products, isError, isLoading } =
    useGetProductTypeQuery({
      type: 'jewelry',
      query: 'per_page=8&orderby=popularity&order=desc',
    });
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <div className='row'>
      <HomeTwoBestSellPrdPrdLoader loading={isLoading}/>
      </div>
    );
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.data?.length > 0) {
    const product_items = products.data.slice(0, 8);
    content = (
      <Swiper {...slider_setting} className="tp-best-slider-active swiper-container mb-10">
        {product_items.map(item => (
          <SwiperSlide key={item._id} className="tp-best-item-4">
            <ProductItem product={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    )
  }
  return (
    <>
      <section className="tp-best-area pt-115">
        <div className="container"> 
            <div className="row">
              <div className="col-xl-12">
                  <div className="tp-section-title-wrapper-4 mb-50 text-center">
                    <span className="tp-section-title-pre-4">Most Purchased</span>
                    <h3 className="tp-section-title-4">Best-selling handmade jewellery</h3>
                  </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-12">
                  <div className="tp-best-slider">
                    {content}
                  </div>
              </div>
            </div>
        </div>
      </section>
    </>
  );
};

export default BestSellerPrd;
