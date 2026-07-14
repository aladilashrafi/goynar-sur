import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryFilter from "../shop/shop-filter/category-filter";
import PriceFilter from "../shop/shop-filter/price-filter";
import StatusFilter from "../shop/shop-filter/status-filter";
import TopRatedProducts from "../shop/shop-filter/top-rated-products";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";
import ResetButton from "../shop/shop-filter/reset-button";
import AttributeFilter from "../shop/shop-filter/attribute-filter";

const ShopFilterOffCanvas = ({
  all_products,
  otherProps,
  right_side = false,
}) => {
  const { priceFilterValues, setCurrPage } = otherProps;
  const { filterSidebar } = useSelector((state) => state.shopFilter);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!filterSidebar) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch(handleFilterSidebarClose());
      }
    };

    document.body.classList.add("gs-filter-drawer-open");
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("gs-filter-drawer-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, filterSidebar]);

  // max price
  const maxPrice = all_products.reduce((max, product) => {
    return product.price > max ? product.price : max;
  }, 0);

  return (
    <>
      <div
        className={`tp-filter-offcanvas-area ${
          filterSidebar ? "offcanvas-opened" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        <div className="tp-filter-offcanvas-wrapper">
          <div className="tp-filter-offcanvas-close">
            <button
              type="button"
              onClick={() => dispatch(handleFilterSidebarClose())}
              className="tp-filter-offcanvas-close-btn filter-close-btn"
            >
              <i className="fa-solid fa-xmark"></i>
              {" "}Close
            </button>
          </div>
          <div className="gs-filter-drawer-head">
            <div>
              <span>Filter</span>
              <strong>Refine Jewellery</strong>
            </div>
            <button type="button" onClick={() => dispatch(handleFilterSidebarClose())} aria-label="Close filters">
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
          <div className="tp-shop-sidebar">
            {/* filter */}
            <PriceFilter
              priceFilterValues={priceFilterValues}
              maxPrice={maxPrice}
            />
            {/* status */}
            <StatusFilter setCurrPage={setCurrPage} shop_right={right_side} />
            {/* categories */}
            <CategoryFilter setCurrPage={setCurrPage} shop_right={right_side} />
            <AttributeFilter setCurrPage={setCurrPage} />
            {/* product rating */}
            <TopRatedProducts />
          </div>
          <div className="gs-filter-drawer-footer">
            <button type="button" className="gs-filter-apply" onClick={() => dispatch(handleFilterSidebarClose())}>
              Apply
            </button>
            <ResetButton shop_right={right_side} compact />
          </div>
        </div>
      </div>

      {/* overlay start */}
      <div
        onClick={() => dispatch(handleFilterSidebarClose())}
        className={`body-overlay ${filterSidebar ? "opened" : ""}`}
      ></div>
      {/* overlay end */}
    </>
  );
};

export default ShopFilterOffCanvas;
