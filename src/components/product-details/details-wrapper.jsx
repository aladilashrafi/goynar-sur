import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
// internal
import { AskQuestion, CompareTwo, WishlistTwo } from '@/svg';
import DetailsBottomInfo from './details-bottom-info';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
import { handleModalClose } from '@/redux/features/productModalSlice';
import ProductRating from '@/components/common/product-rating';
import { useGetProductReviewsQuery } from '@/redux/features/reviewApi';
import SalePrice from '@/components/common/sale-price';

function normalizeAttrName(name = "") {
  return String(name).replace(/^attribute_/, "").replace(/^pa_/, "").toLowerCase();
}

function normalizeAttrValue(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, "");
}

function attrValuesMatch(left, right) {
  if (!left || !right) return false;
  return normalizeAttrValue(left) === normalizeAttrValue(right);
}

function attrKeysMatch(left = {}, right = {}) {
  if (left.id && right.id) return Number(left.id) === Number(right.id);
  return normalizeAttrName(left.slug || left.name) === normalizeAttrName(right.slug || right.name);
}

const DetailsWrapper = ({
  productItem,
  handleImageActive,
  activeImg,
  detailsBottom = false,
  variations = [],
  attributeTermSlugs = {},
  isVariationLoading = false,
}) => {
  const {
    sku,
    img,
    title,
    imageURLs = [],
    category,
    description = "",
    shortDescription = "",
    price,
    regularPrice,
    status,
    averageRating = 0,
    ratingCount = 0,
    tags = [],
    offerDate,
    attributes = [],
    defaultAttributes = [],
    isVariable,
  } = productItem || {};
  const variableAttributes = useMemo(
    () => attributes.filter((attribute) => attribute.variation && attribute.options?.length),
    [attributes]
  );
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [cartError, setCartError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const reviewProductId = productItem?.id || productItem?._id;
  const { data: reviewData } = useGetProductReviewsQuery(reviewProductId, {
    skip: !reviewProductId,
  });
  const liveRating = useMemo(() => {
    const liveReviews = reviewData?.reviews || [];

    if (!liveReviews.length) {
      return { averageRating, ratingCount };
    }

    const ratingTotal = liveReviews.reduce(
      (total, review) => total + (Number(review.rating) || 0),
      0
    );

    return {
      averageRating: ratingTotal / liveReviews.length,
      ratingCount: Number(reviewData?.count) || liveReviews.length,
    };
  }, [averageRating, ratingCount, reviewData]);

  useEffect(() => {
    if (!variableAttributes.length) return;

    const initial = {};
    variableAttributes.forEach((attribute) => {
      const key = normalizeAttrName(attribute.slug || attribute.name);
      const defaultAttribute = defaultAttributes.find((item) =>
        normalizeAttrName(item.name) === normalizeAttrName(attribute.name)
      );
      initial[key] = defaultAttribute?.option || attribute.options[0] || "";
    });
    setSelectedAttributes(initial);
  }, [defaultAttributes, variableAttributes]);

  const matchedVariation = useMemo(() => {
    if (!isVariable || !variations.length) return null;

    return variations.find((variation) =>
      variation.attributes.every((variationAttribute) => {
        const productAttribute = variableAttributes.find((attribute) =>
          attrKeysMatch(attribute, variationAttribute)
        );
        const key = normalizeAttrName(productAttribute?.slug || productAttribute?.name || variationAttribute.slug || variationAttribute.name);
        return !variationAttribute.option || attrValuesMatch(selectedAttributes[key], variationAttribute.option);
      })
    ) || null;
  }, [isVariable, selectedAttributes, variableAttributes, variations]);

  const selectedPrice = matchedVariation ? matchedVariation.price : price;
  const selectedRegularPrice = matchedVariation ? matchedVariation.regularPrice : regularPrice;
  const selectedStatus = matchedVariation
    ? matchedVariation.stock_status === "instock" ? "in-stock" : "out-of-stock"
    : status;
  const selectedQuantity = matchedVariation ? Number(matchedVariation.quantity || 0) : productItem?.quantity;
  const needsVariationSelection = Boolean(isVariable && (!variations.length || !matchedVariation));

  useEffect(() => {
    if (matchedVariation?.image?.src) {
      handleImageActive({ img: matchedVariation.image.src });
    }
  }, [handleImageActive, matchedVariation]);

  function isOptionAvailable(attributeKey, option) {
    if (!isVariable || !variations.length) return true;

    return variations.some((variation) => {
      const matchesThisOption = variation.attributes.some((variationAttribute) => {
        const productAttribute = variableAttributes.find((attribute) =>
          attrKeysMatch(attribute, variationAttribute)
        );
        const key = normalizeAttrName(productAttribute?.slug || productAttribute?.name || variationAttribute.slug || variationAttribute.name);
        return key === attributeKey && attrValuesMatch(option, variationAttribute.option);
      });

      if (!matchesThisOption) return false;

      const matchesOtherOptions = variation.attributes.every((variationAttribute) => {
        const productAttribute = variableAttributes.find((attribute) =>
          attrKeysMatch(attribute, variationAttribute)
        );
        const key = normalizeAttrName(productAttribute?.slug || productAttribute?.name || variationAttribute.slug || variationAttribute.name);
        if (key === attributeKey) return true;
        return !variationAttribute.option || attrValuesMatch(selectedAttributes[key], variationAttribute.option);
      });

      return matchesOtherOptions && variation.stock_status === "instock";
    });
  }

  function selectOption(attributeKey, option) {
    setSelectedAttributes((prev) => ({ ...prev, [attributeKey]: option }));
    setCartError("");
  }

  function buildVariationPayload() {
    if (!matchedVariation) return undefined;

    return matchedVariation.attributes.map((variationAttribute) => {
      const productAttribute = variableAttributes.find((attribute) =>
        attrKeysMatch(attribute, variationAttribute)
      );
      const attributeId = variationAttribute.id || productAttribute?.id || 0;
      const key = normalizeAttrName(productAttribute?.slug || productAttribute?.name || variationAttribute.slug || variationAttribute.name);
      const option = variationAttribute.option || selectedAttributes[key];

      return {
        ...(attributeId ? { id: attributeId } : {}),
        attribute: variationAttribute.slug || productAttribute?.slug || productAttribute?.name || variationAttribute.name,
        value: attributeId ? attributeTermSlugs[attributeId]?.[option] || option : option,
      };
    });
  }

  function buildCartProduct() {
    if (isVariable && !matchedVariation) {
      return null;
    }

    const variationLabels = matchedVariation
      ? matchedVariation.attributes.map((variationAttribute) => {
          const productAttribute = variableAttributes.find((attribute) =>
            attrKeysMatch(attribute, variationAttribute)
          );
          const key = normalizeAttrName(productAttribute?.slug || productAttribute?.name || variationAttribute.slug || variationAttribute.name);
          return {
            name: productAttribute?.name || variationAttribute.name,
            value: selectedAttributes[key] || variationAttribute.option,
          };
        })
      : [];

    return {
      ...productItem,
      _id: matchedVariation ? `${productItem.id}-${matchedVariation.id}` : productItem._id,
      id: productItem.id,
      product_id: productItem.id,
      variation_id: matchedVariation?.id,
      selectedAttributes: variationLabels,
      store_api_variation: buildVariationPayload(),
      price: selectedPrice,
      regularPrice: selectedRegularPrice,
      img: matchedVariation?.image?.src || productItem.img,
      quantity: selectedQuantity,
      status: selectedStatus,
      sku: matchedVariation?.sku || productItem.sku,
    };
  }

  const handleAddProduct = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct) {
      setCartError("Please select a product option before adding to cart.");
      return false;
    }

    dispatch(add_cart_product(cartProduct));
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddProduct()) {
      dispatch(handleModalClose());
      router.push("/checkout");
    }
  };

  // handle wishlist product
  const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = (prd) => {
    dispatch(add_to_compare(prd));
  };

  return (
    <div className="tp-product-details-wrapper">
      <div className="tp-product-details-category">
        <span>{category.name}</span>
      </div>
      <h3 className="tp-product-details-title">{title}</h3>

      {/* inventory details */}
      <div className="tp-product-details-inventory d-flex align-items-center mb-10">
        <div className="tp-product-details-stock mb-10">
            <span>{selectedStatus}</span>
        </div>
        <ProductRating
          averageRating={liveRating.averageRating}
          ratingCount={liveRating.ratingCount}
          className="tp-product-details-rating-wrapper mb-10"
        />
      </div>
      {(shortDescription || description) && (
        <div
          className="tp-product-details-short-description"
          dangerouslySetInnerHTML={{ __html: shortDescription || description }}
        />
      )}

      {/* price */}
      <div className="tp-product-details-price-wrapper mb-20">
        <SalePrice
          price={selectedPrice}
          regularPrice={selectedRegularPrice}
          currentPriceClassName="tp-product-details-price new-price"
          regularPriceClassName="tp-product-details-price old-price"
        />
      </div>

      {isVariable && variableAttributes.length > 0 && (
        <div className="tp-product-details-variation mb-25">
          {variableAttributes.map((attribute) => {
            const attributeKey = normalizeAttrName(attribute.slug || attribute.name);

            return (
              <div className="tp-product-details-variation-item mb-15" key={attribute.id || attribute.name}>
                <h4 className="tp-product-details-variation-title">{attribute.name} :</h4>
                <div className="tp-product-details-variation-list">
                  {attribute.options.map((option) => {
                    const available = isOptionAvailable(attributeKey, option);
                    const active = attrValuesMatch(selectedAttributes[attributeKey], option);

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={!available || isVariationLoading}
                        onClick={() => selectOption(attributeKey, option)}
                        className={`tp-product-details-variation-btn ${active ? "active" : ""}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {needsVariationSelection && (
            <p className="text-danger mt-10">
              {isVariationLoading ? "Loading product options..." : "Please select an available option."}
            </p>
          )}
        </div>
      )}

      {/* variations */}
      {imageURLs.some(item => item?.color && item?.color?.name) && <div className="tp-product-details-variation">
        <div className="tp-product-details-variation-item">
          <h4 className="tp-product-details-variation-title">Color :</h4>
          <div className="tp-product-details-variation-list">
            {imageURLs.map((item, i) => (
              <button onClick={() => handleImageActive(item)} key={i} type="button"
                className={`color tp-color-variation-btn ${item.img === activeImg ? "active" : ""}`} >
                <span
                  data-bg-color={`${item.color.clrCode}`}
                  style={{ backgroundColor: `${item.color.clrCode}` }}
                ></span>
                {item.color && item.color.name && (
                  <span className="tp-color-variation-tootltip">
                    {item.color.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* if ProductDetailsCountdown true start */}
      {offerDate?.endDate && <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />}
      {/* if ProductDetailsCountdown true end */}

      {/* actions */}
      <div className="tp-product-details-action-wrapper">
        <h3 className="tp-product-details-action-title">Quantity</h3>
        <div className="tp-product-details-action-item-wrapper d-sm-flex align-items-center">
          {/* product quantity */}
          <ProductQuantity product={{ ...productItem, quantity: selectedQuantity }} />
          {/* product quantity */}
          <div className="tp-product-details-add-to-cart mb-15 w-100">
            <button
              onClick={handleAddProduct}
              disabled={selectedStatus === 'out-of-stock' || needsVariationSelection}
              className="tp-product-details-add-to-cart-btn w-100"
            >
              {needsVariationSelection ? "Select Options" : "Add To Cart"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={selectedStatus === 'out-of-stock' || needsVariationSelection}
          className="tp-product-details-buy-now-btn w-100"
        >
          {needsVariationSelection ? "Select Options" : "Buy Now"}
        </button>
        {cartError && <p className="text-danger mt-10">{cartError}</p>}
      </div>
      {/* product-details-action-sm start */}
      <div className="tp-product-details-action-sm">
        <button disabled={status === 'out-of-stock'} onClick={() => handleCompareProduct(productItem)} type="button" className="tp-product-details-action-sm-btn">
          <CompareTwo />
          Compare
        </button>
        <button disabled={status === 'out-of-stock'} onClick={() => handleWishlistProduct(productItem)} type="button" className="tp-product-details-action-sm-btn">
          <WishlistTwo />
          Add Wishlist
        </button>
        <button type="button" className="tp-product-details-action-sm-btn">
          <AskQuestion />
          Ask a question
        </button>
      </div>
      {/* product-details-action-sm end */}

      {detailsBottom && <DetailsBottomInfo category={category?.name} sku={sku} tag={tags[0]} />}
    </div>
  );
};

export default DetailsWrapper;
