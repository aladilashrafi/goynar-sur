import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import useCartInfo from "@/hooks/use-cart-info";
import { CartTwo, Menu, Wishlist } from "@/svg";
import { openCartMini } from "@/redux/features/cartSlice";

const HeaderMainRight = ({ setIsCanvasOpen }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { quantity } = useCartInfo();
  const dispatch = useDispatch()
  return (
    <div className="tp-header-main-right d-flex align-items-center justify-content-end">
      <div className="tp-header-action d-flex align-items-center">
        <div className="tp-header-action-item d-none d-lg-block">
          <Link href="/wishlist" className="tp-header-action-btn" aria-label={`Wishlist with ${wishlist.length} items`}>
            <Wishlist />
            <span className="tp-header-action-badge">{wishlist.length}</span>
          </Link>
        </div>
        <div className="tp-header-action-item">
          <button
            onClick={() => dispatch(openCartMini())}
            type="button"
            className="tp-header-action-btn cartmini-open-btn"
            aria-label={`Open cart with ${quantity} items`}
          >
            <CartTwo />
            <span className="tp-header-action-badge">{quantity}</span>
          </button>
        </div>
        <div className="tp-header-action-item d-lg-none">
          <button
            onClick={() => setIsCanvasOpen(true)}
            type="button"
            className="tp-header-action-btn tp-offcanvas-open-btn"
            aria-label="Open navigation menu"
          >
            <Menu />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMainRight;
