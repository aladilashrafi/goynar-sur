import React from "react";
import { calcDiscountPercent, formatPrice } from "@/utils/formatPrice";

const SalePrice = ({
  price = 0,
  regularPrice = 0,
  className = "",
  currentPriceClassName = "",
  regularPriceClassName = "",
  showSavings = true,
}) => {
  const current = Number(price) || 0;
  const regular = Number(regularPrice) || 0;
  const discount = calcDiscountPercent(regular, current);
  const isOnSale = discount > 0 && regular > current;

  return (
    <div className={`gs-sale-price ${className}`.trim()}>
      <span className={`gs-sale-price__current ${currentPriceClassName}`.trim()}>
        {formatPrice(current)}
      </span>
      {isOnSale && (
        <>
          <del className={`gs-sale-price__regular ${regularPriceClassName}`.trim()}>
            {formatPrice(regular)}
          </del>
          {showSavings && <span className="gs-sale-price__saving">Save {discount}%</span>}
        </>
      )}
    </div>
  );
};

export default SalePrice;
