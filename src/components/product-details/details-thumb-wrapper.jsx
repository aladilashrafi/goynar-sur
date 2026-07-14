import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import PopupVideo from "../common/popup-video";

const DetailsThumbWrapper = ({
  imageURLs,
  handleImageActive,
  activeImg,
  imgWidth = 480,
  imgHeight = 480,
  videoId = false,
  status,
  priority = false,
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const preloadedImages = useRef(new Set());

  const preloadImage = useCallback((src) => {
    if (!src || typeof window === "undefined" || preloadedImages.current.has(src)) return;

    preloadedImages.current.add(src);
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
  }, []);

  useEffect(() => {
    imageURLs?.slice(0, 8).forEach((item) => preloadImage(item.img));
  }, [imageURLs, preloadImage]);

  const activateImage = (item) => {
    if (!item?.img || item.img === activeImg) return;
    preloadImage(item.img);
    handleImageActive(item);
  };

  return (
    <>
      <div className="tp-product-details-thumb-wrapper tp-tab d-sm-flex">
        <nav>
          <div className="nav nav-tabs flex-sm-column">
            {imageURLs?.map((item, i) => {
              const isActive = item.img === activeImg;

              return (
                <button
                  key={i}
                  type="button"
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onClick={() => activateImage(item)}
                  onTouchStart={() => activateImage(item)}
                  onFocus={() => preloadImage(item.img)}
                  onMouseEnter={() => preloadImage(item.img)}
                  onPointerDown={(event) => {
                    if (event.pointerType !== "mouse") activateImage(item);
                  }}
                  aria-label={`View product image ${i + 1}`}
                  aria-pressed={isActive}
                >
                  <NextImage
                    src={item.img}
                    alt={`Product thumbnail ${i + 1}`}
                    width={78}
                    height={78}
                    sizes="78px"
                    loading={i < 4 ? "eager" : "lazy"}
                    style={{ width: "100%", height: "100%" }}
                  />
                </button>
              );
            })}
          </div>
        </nav>
        <div className="tab-content m-img">
          <div className="tab-pane fade show active">
            <div className="tp-product-details-nav-main-thumb p-relative">
              <NextImage
                src={activeImg}
                alt="Selected product image"
                width={imgWidth}
                height={imgHeight}
                priority={priority}
                decoding="async"
                sizes="(max-width: 575px) 92vw, (max-width: 991px) 50vw, 580px"
              />
              <div className="tp-product-badge">
                {status === 'out-of-stock' && <span className="product-hot">out-stock</span>}
              </div>
              {videoId && (
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="tp-product-details-thumb-video"
                  aria-label="Play product video"
                >
                  <span className="tp-product-details-thumb-video-btn cursor-pointer popup-video">
                    <i className="fas fa-play"></i>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* modal popup start */}
      {videoId && (
        <PopupVideo
          isVideoOpen={isVideoOpen}
          setIsVideoOpen={setIsVideoOpen}
          videoId={videoId}
        />
      )}
      {/* modal popup end */}
    </>
  );
};

export default DetailsThumbWrapper;
