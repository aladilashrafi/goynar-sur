import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import Pagination from "@/ui/Pagination";
import ProductItem from "../products/jewelry/product-item";
import CategoryFilter from "./shop-filter/category-filter";
import PriceFilter from "./shop-filter/price-filter";
import StatusFilter from "./shop-filter/status-filter";
import TopRatedProducts from "./shop-filter/top-rated-products";
import ShopListItem from "./shop-list-item";
import ShopTopLeft from "./shop-top-left";
import ShopTopRight from "./shop-top-right";
import ResetButton from "./shop-filter/reset-button";
import { GridTab, ListTab } from "@/svg";
import { handleFilterSidebarOpen } from "@/redux/features/shop-filter-slice";

const SORT_OPTIONS = [
  "Default Sorting",
  "Low to High",
  "High to Low",
  "New Added",
  "On Sale",
  "Popularity",
  "Rating",
];

const FILTER_LABELS = {
  min_price: "Min price",
  max_price: "Max price",
  category: "Category",
  status: "Status",
  featured: "Featured",
  attribute: "Attribute",
  attribute_term: "Option",
};

const ShopArea = ({ all_products, products, otherProps }) => {
  const {priceFilterValues,selectHandleFilter,currPage,setCurrPage} = otherProps;
  const [filteredRows, setFilteredRows] = useState(products);
  const [pageStart, setPageStart] = useState(0);
  const [countOfPage, setCountOfPage] = useState(12);
  const [viewMode, setViewMode] = useState("grid");
  const router = useRouter();
  const dispatch = useDispatch();

  const paginatedData = (items, startPage, pageCount) => {
    setFilteredRows(items);
    setPageStart(startPage);
    setCountOfPage(pageCount);
  };

  useEffect(() => {
    setFilteredRows(products);
    setPageStart(0);
  }, [products]);

  // max price
  const maxPrice = all_products.reduce((max, product) => {
    return product.price > max ? product.price : max;
  }, 0);
  const showing = products.length === 0
    ? 0
    : filteredRows.slice(pageStart, pageStart + countOfPage).length;
  const activeChips = useMemo(() => {
    const chips = Object.entries(router.query)
      .filter(([key, value]) => {
        if (
          ["slug", "sort", "attribute_term", "attribute_relation", "attribute_label", "attribute_term_label", "category_label"].includes(key) ||
          key.startsWith("attr_label_") ||
          key.startsWith("attr_term_labels_")
        ) return false;
        return value !== undefined && value !== "";
      })
      .map(([key, value]) => ({
        key,
        label: key === "attribute"
          ? `${router.query.attribute_label || "Option"}: ${router.query.attribute_term_label || router.query.attribute_term || value}`
          : key === "category"
            ? `${FILTER_LABELS[key]}: ${router.query.category_label || value}`
            : key.startsWith("attr_")
              ? `${router.query[`attr_label_${key.slice(5)}`] || "Option"}: ${router.query[`attr_term_labels_${key.slice(5)}`] || value}`
          : `${FILTER_LABELS[key] || key.replace(/_/g, " ")}: ${String(value)}`,
      }));
    return chips;
  }, [router.query]);

  const removeFilter = (key) => {
    const nextQuery = { ...router.query };
    delete nextQuery[key];
    if (key === "attribute" || key === "attribute_term") {
      delete nextQuery.attribute;
      delete nextQuery.attribute_term;
      delete nextQuery.attribute_relation;
      delete nextQuery.attribute_label;
      delete nextQuery.attribute_term_label;
    }
    if (key === "category") {
      delete nextQuery.category_label;
    }
    if (key.startsWith("attr_")) {
      const taxonomy = key.slice(5);
      delete nextQuery[`attr_label_${taxonomy}`];
      delete nextQuery[`attr_term_labels_${taxonomy}`];
    }
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { scroll: false });
  };

  const clearFilters = () => {
    const nextQuery = { ...router.query };
    Object.keys(nextQuery).forEach((key) => {
      if (!["slug", "sort"].includes(key)) delete nextQuery[key];
    });
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { scroll: false });
  };

  return (
    <>
      <section className="tp-shop-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4 d-none d-lg-block">
              <div className="tp-shop-sidebar mr-10">
                {/* filter */}
                <PriceFilter
                  priceFilterValues={priceFilterValues}
                  maxPrice={maxPrice}
                />
                {/* status */}
                <StatusFilter setCurrPage={setCurrPage} />
                {/* categories */}
                <CategoryFilter setCurrPage={setCurrPage} />
                {/* product rating */}
                <TopRatedProducts />
                {/* reset filter */}
                <ResetButton/>
              </div>
            </div>
            <div className="col-xl-9 col-lg-8">
              <div className="tp-shop-main-wrapper">
                <div className="gs-mobile-shop-toolbar" role="region" aria-label="Shop controls">
                  <div className="gs-mobile-shop-count">
                    <strong>{showing}</strong> of {all_products.length}
                  </div>
                  <label className="gs-mobile-shop-sort">
                    <span className="visually-hidden">Sort products</span>
                    <select
                      value={router.query.sort || "Default Sorting"}
                      onChange={(event) => selectHandleFilter({ value: event.target.value })}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <div className="gs-mobile-shop-view" role="group" aria-label="View mode">
                    <button
                      type="button"
                      className={viewMode === "grid" ? "active" : ""}
                      aria-pressed={viewMode === "grid"}
                      onClick={() => setViewMode("grid")}
                    >
                      <GridTab />
                    </button>
                    <button
                      type="button"
                      className={viewMode === "list" ? "active" : ""}
                      aria-pressed={viewMode === "list"}
                      onClick={() => setViewMode("list")}
                    >
                      <ListTab />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="gs-mobile-shop-filter-btn"
                    onClick={() => dispatch(handleFilterSidebarOpen())}
                  >
                    <i className="fa-regular fa-sliders"></i>
                    Filter
                    {activeChips.length > 0 && <span>{activeChips.length}</span>}
                  </button>
                </div>
                {activeChips.length > 0 && (
                  <div className="gs-mobile-shop-chips" aria-label="Active filters">
                    {activeChips.map((chip) => (
                      <button key={chip.key} type="button" onClick={() => removeFilter(chip.key)}>
                        {chip.label}
                        <i className="fa-regular fa-xmark" aria-hidden="true"></i>
                      </button>
                    ))}
                    <button type="button" className="is-clear" onClick={clearFilters}>Clear</button>
                  </div>
                )}
                <div className="tp-shop-top mb-45">
                  <div className="row">
                    <div className="col-xl-6">
                      <ShopTopLeft
                        showing={showing}
                        total={all_products.length}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                      />
                    </div>
                    <div className="col-xl-6">
                      <ShopTopRight selectHandleFilter={selectHandleFilter} />
                    </div>
                  </div>
                </div>
                {products.length === 0 && <h2>No products found</h2>}
                {products.length > 0 && (
                  <div className="tp-shop-items-wrapper tp-shop-item-primary">
                    <div className="tab-content" id="productTabContent">
                      <div
                        className={`tab-pane fade ${viewMode === "grid" ? "show active" : ""}`}
                        id="grid-tab-pane"
                        role="tabpanel"
                        aria-labelledby="grid-tab"
                        tabIndex="0"
                      >
                        <div className="row gs-mobile-product-grid">
                          {filteredRows
                            .slice(pageStart, pageStart + countOfPage)
                            .map((item) => (
                              <div
                                key={item._id}
                                className="col-xl-4 col-md-6 col-sm-6"
                              >
                                <ProductItem product={item} />
                              </div>
                            ))}
                        </div>
                      </div>
                      <div
                        className={`tab-pane fade ${viewMode === "list" ? "show active" : ""}`}
                        id="list-tab-pane"
                        role="tabpanel"
                        aria-labelledby="list-tab"
                        tabIndex="0"
                      >
                        <div className="tp-shop-list-wrapper tp-shop-item-primary mb-70">
                          <div className="row">
                            <div className="col-xl-12">
                              {filteredRows
                                .slice(pageStart, pageStart + countOfPage)
                                .map((item) => (
                                  <ShopListItem key={item._id} product={item} />
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {products.length > 0 && (
                  <div className="tp-shop-pagination mt-20">
                    <div className="tp-pagination">
                      <Pagination
                        items={products}
                        countOfPage={12}
                        paginatedData={paginatedData}
                        currPage={currPage}
                        setCurrPage={setCurrPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopArea;
