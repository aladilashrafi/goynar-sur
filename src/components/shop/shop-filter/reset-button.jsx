import { useRouter } from "next/router";
import React from "react";

const ResetButton = ({ shop_right = false, compact = false }) => {
  const router = useRouter();
  const button = (
    <button
        onClick={() => {
          if (router.pathname.includes("product-category")) {
            router.push({ pathname: router.pathname, query: { slug: router.query.slug } }, undefined, { scroll: false });
            return;
          }
          router.push(`/${shop_right ? "shop-right-sidebar" : "shop"}`);
        }}
        className={compact ? "gs-filter-reset" : "tp-btn"}
      >
        Reset Filter
      </button>
  );

  if (compact) return button;

  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Reset Filter</h3>
      {button}
    </div>
  );
};

export default ResetButton;
