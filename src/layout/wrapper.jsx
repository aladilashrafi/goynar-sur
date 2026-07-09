import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
// internal
import BackToTopCom from "@/components/common/back-to-top";
import {
  get_cart_products,
  initialOrderQuantity,
} from "@/redux/features/cartSlice";
import { get_wishlist_products, sync_wishlist_from_account } from "@/redux/features/wishlist-slice";
import { get_compare_products } from "@/redux/features/compareSlice";
import { get_coupons } from "@/redux/features/coupon/couponSlice";
import useAuthCheck from "@/hooks/use-auth-check";
import Loader from "@/components/loader/loader";

const ProductModal = dynamic(() => import("@/components/common/product-modal"), {
  ssr: false,
});

const Wrapper = ({ children }) => {
  const { productItem } = useSelector((state) => state.productModal);
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const authChecked = useAuthCheck();

  useEffect(() => {
    dispatch(get_cart_products());
    dispatch(get_wishlist_products());
    dispatch(get_compare_products());
    dispatch(get_coupons());
    dispatch(initialOrderQuantity());
  }, [dispatch]);

  useEffect(() => {
    if (authChecked && accessToken) {
      dispatch(sync_wishlist_from_account());
    }
  }, [accessToken, authChecked, dispatch]);

  return !authChecked ? (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <Loader spinner="fade" loading={!authChecked} />
    </div>
  ) : (
    <div id="wrapper">
      {children}
      <BackToTopCom />
      <ToastContainer />
      {/* product modal start */}
      {productItem && <ProductModal />}
      {/* product modal end */}
    </div>
  );
};

export default Wrapper;
