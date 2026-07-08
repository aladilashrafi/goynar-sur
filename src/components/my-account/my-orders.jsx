import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { formatPrice } from "@/utils/formatPrice";

const statusClass = (status) => {
  if (["pending", "on-hold"].includes(status)) return "pending";
  if (status === "processing") return "hold";
  if (status === "completed") return "done";
  return "";
};

const MyOrders = ({ orderData, isLoading = false, isError = false }) => {
  const orderItems = orderData?.orders || [];

  if (isLoading) {
    return (
      <div
        style={{ height: "210px" }}
        className="d-flex align-items-center justify-content-center"
      >
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{ height: "210px" }}
        className="d-flex align-items-center justify-content-center"
      >
        <div className="text-center">
          <p>Unable to load orders right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile__ticket table-responsive">
      {orderItems.length === 0 && (
        <div
          style={{ height: "210px" }}
          className="d-flex align-items-center justify-content-center"
        >
          <div className="text-center">
            <i
              style={{ fontSize: "30px" }}
              className="fa-solid fa-cart-circle-xmark"
            ></i>
            <p>You have no orders yet.</p>
          </div>
        </div>
      )}
      {orderItems.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Order ID</th>
              <th scope="col">Order Time</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">View</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.id}>
                <th scope="row">#{item.number || item.id}</th>
                <td data-info="title">
                  {item.createdAt ? dayjs(item.createdAt).format("MMMM D, YYYY") : "N/A"}
                </td>
                <td>{formatPrice(item.total)}</td>
                <td
                  data-info={`status ${statusClass(item.status)}`}
                  className={`status ${statusClass(item.status)}`}
                >
                  {item.statusLabel || item.status}
                </td>
                <td>
                  <Link href={`/order/${item.id}`} className="tp-logout-btn">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;
