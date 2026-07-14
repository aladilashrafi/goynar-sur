import React, { useRef, useEffect } from 'react';
import ReviewForm from '../forms/review-form';
import ReviewItem from './review-item';

const NavItem = ({ active = false, id, title, linkRef, onActivate }) => (
  <button
    ref={linkRef}
    className={`nav-link ${active ? "active" : ""}`}
    id={`nav-${id}-tab`}
    data-bs-toggle="tab"
    data-bs-target={`#nav-${id}`}
    type="button"
    role="tab"
    aria-controls={`nav-${id}`}
    aria-selected={active ? "true" : "false"}
    tabIndex={active ? 0 : -1}
    onClick={onActivate}
  >
    {title}
  </button>
);

const DetailsTabNav = ({ product }) => {
  const {_id, description, additionalInformation = [], reviews = [] } = product || {};
  const activeRef = useRef(null)
  const marker = useRef(null);
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + (Number(review.rating) || 0), 0) / reviews.length
    : 0;
  // handleActive
  const handleActive = (e) => {
    if (e.target.classList.contains('active')) {
      marker.current.style.left = e.target.offsetLeft + "px";
      marker.current.style.width = e.target.offsetWidth + "px";
    }
  }
  useEffect(() => {
    if (activeRef.current?.classList.contains('active')) {
      marker.current.style.left = activeRef.current.offsetLeft + 'px';
      marker.current.style.width = activeRef.current.offsetWidth + 'px';
    }
  }, []);
  return (
    <>
      <div className="tp-product-details-tab-nav tp-tab">
        <nav>
          <div className="nav nav-tabs justify-content-center p-relative tp-product-tab" id="navPresentationTab" role="tablist">
            <NavItem active={true} linkRef={activeRef} id="desc" title="Description" onActivate={handleActive} />
            <NavItem id="additional" title="Additional information" onActivate={handleActive} />
            <NavItem id="review" title={`Reviews (${reviews.length})`} onActivate={handleActive} />

            <span ref={marker} id="productTabMarker" className="tp-product-details-tab-line"></span>
          </div>
        </nav>
        <div className="tab-content" id="navPresentationTabContent">
          {/* nav-desc */}
          <div className="tab-pane fade show active" id="nav-desc" role="tabpanel" aria-labelledby="nav-desc-tab" tabIndex="-1">
            <div className="tp-product-details-desc-wrapper pt-60">
              <div className="row">
                <div className="col-xl-12">
                    <div className="tp-product-details-desc-item gs-mobile-pdp-description">
                    <div className="row align-items-center">
                      <div className="col-lg-12">
                        <div
                          className="tp-product-details-desc-content"
                          dangerouslySetInnerHTML={{ __html: description || "" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* addInfo */}
          <div className="tab-pane fade" id="nav-additional" role="tabpanel" aria-labelledby="nav-additional-tab" tabIndex="-1">

            <div className="tp-product-details-additional-info ">
              <div className="row justify-content-center">
                <div className="col-xl-10">
                  <table>
                    <caption className="visually-hidden">Product materials and handmade details</caption>
                    <tbody>
                      {additionalInformation.map((item) => (
                        <tr key={item.key || item.name}>
                          <th scope="row">{item.name}</th>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {additionalInformation.length === 0 && (
                    <p className="text-center mb-0">No additional product details are available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* review */}
          <div className="tab-pane fade" id="nav-review" role="tabpanel" aria-labelledby="nav-review-tab" tabIndex="-1">
            <div className="tp-product-details-review-wrapper pt-60">
              <div className="row">
                <div className="col-lg-6">
                  <div className="tp-product-details-review-statics">

                    {/* reviews */}
                    <div className="tp-product-details-review-list pr-110">
                      <h3 className="tp-product-details-review-title">Rating & Review</h3>
                      <div className="gs-mobile-review-summary" aria-label={`${averageRating.toFixed(1)} out of 5 from ${reviews.length} reviews`}>
                        <div>
                          <strong>{averageRating.toFixed(1)}</strong>
                          <span>out of 5</span>
                        </div>
                        <div>
                          <span className="gs-mobile-review-stars" aria-hidden="true">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={star <= Math.round(averageRating) ? "fa-solid fa-star" : "fa-regular fa-star"}
                              ></i>
                            ))}
                          </span>
                          <strong>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</strong>
                          <span>Feedback from Goynar Sur customers</span>
                        </div>
                      </div>
                      {reviews.length === 0 && <h3 className="tp-product-details-review-title">
                        There are no reviews yet.
                      </h3>
                      }
                      {reviews.length > 0 && reviews.map(item => (
                        <ReviewItem key={item._id} review={item} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="tp-product-details-review-form">
                    <h3 className="tp-product-details-review-form-title">Review this product</h3>
                    <p>Your email address will not be published. Required fields are marked *</p>
                    {/* form start */}
                    <ReviewForm product_id={_id} />
                    {/* form end */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsTabNav;
