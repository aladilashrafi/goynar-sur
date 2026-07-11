import React, { useEffect } from "react";
import { useRouter } from "next/router";
import ProfileNavTab from "./profile-nav-tab";
import ProfileShape from "./profile-shape";
import NavProfileTab from "./nav-profile-tab";
import ProfileInfo from "./profile-info";
import ChangePassword from "./change-password";
import MyOrders from "./my-orders";
import { useGetUserOrdersQuery } from "@/redux/features/order/orderApi";

const ProfileArea = () => {
  const router = useRouter();
  const {
    data: orderData,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetUserOrdersQuery();

  useEffect(() => {
    if (!router.isReady) return;
    const section = typeof router.query.section === "string" ? router.query.section : "profile";
    const allowed = new Set(["profile", "information", "order", "orders", "password"]);
    if (!allowed.has(section)) return;
    const target = section === "orders" ? "order" : section;
    document.getElementById(`nav-${target}-tab`)?.click();
  }, [router.isReady, router.query.section]);

  return (
    <>
      <section className="profile__area pt-120 pb-120">
        <div className="container">
          <div className="profile__inner p-relative">
            <ProfileShape />
            <div className="row">
              <div className="col-xxl-4 col-lg-4">
                <div className="profile__tab mr-40">
                  <ProfileNavTab />
                </div>
              </div>
              <div className="col-xxl-8 col-lg-8">
                <div className="profile__tab-content">
                  <div className="tab-content" id="profile-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="nav-profile"
                      role="tabpanel"
                      aria-labelledby="nav-profile-tab"
                    >
                      <NavProfileTab
                        orderData={orderData}
                        isOrderLoading={isOrderLoading}
                      />
                    </div>

                    <div
                      className="tab-pane fade"
                      id="nav-information"
                      role="tabpanel"
                      aria-labelledby="nav-information-tab"
                    >
                      <ProfileInfo />
                    </div>

                    <div
                      className="tab-pane fade"
                      id="nav-password"
                      role="tabpanel"
                      aria-labelledby="nav-password-tab"
                    >
                      <ChangePassword />
                    </div>

                    <div
                      className="tab-pane fade"
                      id="nav-order"
                      role="tabpanel"
                      aria-labelledby="nav-order-tab"
                    >
                      <MyOrders
                        orderData={orderData}
                        isLoading={isOrderLoading}
                        isError={isOrderError}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileArea;
