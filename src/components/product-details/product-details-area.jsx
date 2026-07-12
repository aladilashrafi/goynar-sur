import React, { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DetailsThumbWrapper from "./details-thumb-wrapper";
import DetailsWrapper from "./details-wrapper";
import { useGetProductVariationsQuery } from "@/redux/features/productApi";
import LazySection from "@/components/common/lazy-section";

const ProductDetailsTabsSection = dynamic(() => import("./product-details-tabs-section"));
const RelatedProducts = dynamic(() => import("./related-products"));

const ProductDetailsArea = ({ productItem }) => {
  const { _id, id, img, imageURLs, videoId,status, isVariable } = productItem || {};
  const [activeImg, setActiveImg] = useState(img);
  const { data: variationData, isFetching: isVariationLoading } = useGetProductVariationsQuery(id || _id, {
    skip: !isVariable || !(id || _id),
  });
  // active image change when img change
  useEffect(() => {
    setActiveImg(img);
  }, [img]);

  // handle image active
  const handleImageActive = useCallback((item) => {
    setActiveImg(item.img);
  }, []);
  return (
    <section className="tp-product-details-area">
      <div className="tp-product-details-top pb-115">
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-6">
              {/* product-details-thumb-wrapper start */}
              <DetailsThumbWrapper
                activeImg={activeImg}
                handleImageActive={handleImageActive}
                imageURLs={imageURLs}
                imgWidth={580}
                imgHeight={670}
                videoId={videoId}
                status={status}
                priority={true}
              />
              {/* product-details-thumb-wrapper end */}
            </div>
            <div className="col-xl-5 col-lg-6">
              {/* product-details-wrapper start */}
              <DetailsWrapper
                productItem={productItem}
                handleImageActive={handleImageActive}
                activeImg={activeImg}
                detailsBottom={true}
                variations={variationData?.variations || []}
                attributeTermSlugs={variationData?.attributeTermSlugs || {}}
                isVariationLoading={isVariationLoading}
              />
              {/* product-details-wrapper end */}
            </div>
          </div>
        </div>
      </div>

      {/* product details description */}
      <div className="tp-product-details-bottom pb-140">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <LazySection minHeight={360}>
                <ProductDetailsTabsSection product={productItem} />
              </LazySection>
            </div>
          </div>
        </div>
      </div>
      {/* product details description */}

      {/* related products start */}
      <section className="tp-related-product pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="tp-section-title-wrapper-6 text-center mb-40">
              <span className="tp-section-title-pre-6">Discover More</span>
              <h3 className="tp-section-title-6">Related Products</h3>
            </div>
          </div>
          <div className="row">
            <LazySection minHeight={360}>
              <RelatedProducts id={_id} />
            </LazySection>
          </div>
        </div>
      </section>
      {/* related products end */}
    </section>
  );
};

export default ProductDetailsArea;
