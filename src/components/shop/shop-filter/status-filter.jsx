import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";

const StatusFilter = ({setCurrPage,shop_right=false}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const status = [
    { label: "On sale", key: "status", value: "on-sale" },
    { label: "In Stock", key: "status", value: "in-stock" },
    { label: "Featured", key: "featured", value: "true" },
  ];

  // handle status route 
  const handleStatusRoute = (filter) => {
    setCurrPage(1)
    const nextQuery = { ...router.query };
    if (router.query[filter.key] === filter.value) {
      delete nextQuery[filter.key];
    } else {
      nextQuery[filter.key] = filter.value;
    }
    router.push({
      pathname: router.pathname.includes("product-category") ? router.pathname : `/${shop_right ? "shop-right-sidebar" : "shop"}`,
      query: nextQuery,
    }, undefined, { scroll: false });
      dispatch(handleFilterSidebarClose())
  }
  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Product Status</h3>
      <div className="tp-shop-widget-content">
        <div className="tp-shop-widget-checkbox">
          <ul className="filter-items filter-checkbox">
            {status.map((s, i) => (
              <li key={i} className="filter-item checkbox">
                <input
                  id={s.label}
                  type="checkbox"
                  checked={router.query[s.key] === s.value}
                  readOnly
                />
                <label
                  onClick={() => handleStatusRoute(s)}
                  htmlFor={s.label}
                >
                  {s.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatusFilter;
