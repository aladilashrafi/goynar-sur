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
        <p role="status" aria-live="polite">Loading your orders...</p>
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
    <div className="profile__ticket">
      <div className="gs-order-history-heading">
        <h3 className="profile__info-title">Order History</h3>
        <span>{orderItems.length} {orderItems.length === 1 ? "order" : "orders"}</span>
      </div>
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
        <>
        <div className="account-order-cards d-md-none">
          {orderItems.map((item) => {
            const number = item.number || item.id;
            return (
              <article className={`account-order-card gs-order-card gs-order-${statusClass(item.status) || "default"}`} key={item.id}>
                <header><div><strong>Order #{number}</strong><span>{item.createdAt ? dayjs(item.createdAt).format("MMMM D, YYYY · h:mm A") : "N/A"}</span></div><span className={`status ${statusClass(item.status)}`}>{item.statusLabel || item.status}</span></header>
                <dl>
                  <div><dt>Total</dt><dd>{formatPrice(item.total)}</dd></div>
                  <div><dt>Items</dt><dd>{item.lineItems?.length || item.items?.length || 0}</dd></div>
                  <div><dt>Payment</dt><dd>{item.paymentMethod === "cod" ? "COD" : item.paymentMethod || "COD"}</dd></div>
                </dl>
                <footer>
                  <Link href={`/order/${item.id}`} className="tp-logout-btn" aria-label={`View order ${number}`}>{item.status === "processing" ? "Track Order" : "View Details"}</Link>
                  <Link href="/contact" className="gs-order-help">Need Help?</Link>
                </footer>
              </article>
            );
          })}
        </div>
        <div className="table-responsive d-none d-md-block">
        <table className="table">
          <caption className="visually-hidden">Your WooCommerce order history</caption>
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
                    <span aria-hidden="true">View</span><span className="visually-hidden">View order {item.number || item.id}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
