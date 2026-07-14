import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Box, DeliveryTwo, Processing, Truck } from "@/svg";
import { userLoggedOut } from "@/redux/features/auth/authSlice";
import Link from "next/link";

const NavProfileTab = ({ orderData, isOrderLoading = false }) => {
  const {user} = useSelector(state => state.auth)
  const dispatch = useDispatch();
  const router = useRouter();
  // handle logout
  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push('/')
  }
  return (
    <div className="profile__main gs-account-dashboard">
      <div className="profile__main-top pb-80">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="profile__main-inner d-flex flex-wrap align-items-center">
              <div className="profile__main-content">
                <span className="gs-account-welcome-label">Welcome back</span>
                <h4 className="profile__main-title">{user?.name || "Goynar Sur Customer"}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="profile__main-logout text-sm-end">
              <button type="button" onClick={handleLogout} className="cursor-pointer tp-logout-btn gs-account-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="profile__main-info">
        <div className="row gx-3">
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-download">{isOrderLoading ? "..." : orderData?.totalDoc || 0}</span>
                  <Box />
                </span>
              </div>
              <h4 className="profile__main-info-title">Total Order</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-order">{isOrderLoading ? "..." : orderData?.pending || 0}</span>
                  <Processing />
                </span>
              </div>
              <h4 className="profile__main-info-title">Pending Order</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-wishlist">
                    {isOrderLoading ? "..." : orderData?.processing || 0}
                  </span>
                  <Truck />
                </span>
              </div>
              <h4 className="profile__main-info-title">Processing Order</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-wishlist">
                    {isOrderLoading ? "..." : orderData?.delivered || 0}
                  </span>
                  <DeliveryTwo />
                </span>
              </div>
              <h4 className="profile__main-info-title">Complete Order</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="gs-account-quick-actions">
        <h5>Quick Actions</h5>
        <Link href="/profile?section=information">
          <span><i className="fa-regular fa-user-pen" aria-hidden="true"></i> Personal &amp; Address Details</span>
          <i className="fa-regular fa-angle-right" aria-hidden="true"></i>
        </Link>
        <Link href="/profile?section=orders">
          <span><i className="fa-light fa-clipboard-list-check" aria-hidden="true"></i> Order History</span>
          <strong>{isOrderLoading ? "…" : orderData?.totalDoc || 0}</strong>
          <i className="fa-regular fa-angle-right" aria-hidden="true"></i>
        </Link>
        <Link href="/profile?section=password">
          <span><i className="fa-regular fa-lock" aria-hidden="true"></i> Change Password</span>
          <i className="fa-regular fa-angle-right" aria-hidden="true"></i>
        </Link>
      </div>
    </div>
  );
};

export default NavProfileTab;
