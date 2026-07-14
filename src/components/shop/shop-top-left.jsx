import { GridTab, ListTab } from "@/svg";
import React from "react";

const ShopTopLeft = ({total,showing=9, viewMode = "grid", setViewMode}) => {
  return (
    <>
      <div className="tp-shop-top-left d-flex align-items-center ">
        <div className="tp-shop-top-tab tp-tab">
          <ul className="nav nav-tabs" id="productTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${viewMode === "grid" ? "active" : ""}`}
                id="grid-tab"
                type="button"
                role="tab"
                aria-controls="grid-tab-pane"
                aria-selected={viewMode === "grid"}
                tabIndex={-1}
                onClick={() => setViewMode?.("grid")}
              >
                <GridTab />
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${viewMode === "list" ? "active" : ""}`}
                id="list-tab"
                type="button"
                role="tab"
                aria-controls="list-tab-pane"
                aria-selected={viewMode === "list"}
                tabIndex={-1}
                onClick={() => setViewMode?.("list")}
              >
                <ListTab />
              </button>
            </li>
          </ul>
        </div>
        <div className="tp-shop-top-result">
          <p>Showing 1–{showing} of {total} results</p>
        </div>
      </div>
    </>
  );
};

export default ShopTopLeft;
