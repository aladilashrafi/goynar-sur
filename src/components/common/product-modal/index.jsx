import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactModal from "react-modal";
// internal
import { handleModalClose } from "@/redux/features/productModalSlice";
import DetailsThumbWrapper from "@/components/product-details/details-thumb-wrapper";
import DetailsWrapper from "@/components/product-details/details-wrapper";
import { initialOrderQuantity } from "@/redux/features/cartSlice";
import { useGetProductVariationsQuery } from "@/redux/features/productApi";

const ProductModal = () => {
  const { productItem, isModalOpen } = useSelector(
    (state) => state.productModal
  );
  const { _id, id, img, imageURLs,status, isVariable } = productItem || {};
  const [activeImg, setActiveImg] = useState(img);
  const [loading,setLoading] = useState(false);
  const { data: variationData, isFetching: isVariationLoading } = useGetProductVariationsQuery(id || _id, {
    skip: !isVariable || !(id || _id),
  });
  const dispatch = useDispatch();
  // active image change when img change
  useEffect(() => {
    setActiveImg(img);
    dispatch(initialOrderQuantity())
    setLoading(false)
  }, [img,dispatch]);

  // handle image active
  const handleImageActive = (item) => {
    setActiveImg(item.img);
    setLoading(true)
  };

  return (
    <div>
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => dispatch(handleModalClose())}
        className="gs-product-modal-content"
        overlayClassName="gs-product-modal-overlay"
        contentLabel="Quick view product"
      >
        {productItem && (
        <div className="tp-product-modal">
          <div className="gs-product-modal-handle" aria-hidden="true"></div>
          <div className="gs-product-modal-header">
            <span>Quick View</span>
            <button
              onClick={() => dispatch(handleModalClose())}
              type="button"
              aria-label="Close quick view"
            >
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
          <div className="tp-product-modal-content d-lg-flex">
            <button
              onClick={() => dispatch(handleModalClose())}
              type="button"
              className="tp-product-modal-close-btn"
            >
              <i className="fa-regular fa-xmark"></i>
            </button>
            {/* product-details-thumb-wrapper start */}
            <DetailsThumbWrapper
              activeImg={activeImg}
              handleImageActive={handleImageActive}
              imageURLs={imageURLs}
              imgWidth={416}
              imgHeight={480}
              loading={loading}
              status={status}
            />
            {/* product-details-thumb-wrapper end */}

            {/* product-details-wrapper start */}
            <DetailsWrapper
              productItem={productItem}
              handleImageActive={handleImageActive}
              activeImg={activeImg}
              variations={variationData?.variations || []}
              attributeTermSlugs={variationData?.attributeTermSlugs || {}}
              isVariationLoading={isVariationLoading}
            />
            {/* product-details-wrapper end */}
          </div>
        </div>
        )}
      </ReactModal>
    </div>
  );
};

export default ProductModal;
