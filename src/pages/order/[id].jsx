import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
// internal
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useGetUserOrderByIdQuery } from "@/redux/features/order/orderApi";
import { formatPrice } from "@/utils/formatPrice";

const terminalStatuses = ["cancelled", "failed", "refunded"];

const timelineSteps = [
  {
    key: "pending",
    title: "Order Placed",
    description: "We received your order.",
    statuses: ["pending", "on-hold", "processing", "completed"],
  },
  {
    key: "confirmed",
    title: "Confirming",
    description: "Our team is checking stock and delivery details.",
    statuses: ["on-hold", "processing", "completed"],
  },
  {
    key: "processing",
    title: "Processing",
    description: "Your jewellery is being prepared for delivery.",
    statuses: ["processing", "completed"],
  },
  {
    key: "completed",
    title: "Completed",
    description: "The order has been completed.",
    statuses: ["completed"],
  },
];

function statusLabel(status = "") {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  return value ? dayjs(value).format("MMMM D, YYYY h:mm A") : "Not available";
}

function addressLines(address = {}, includeContact = false) {
  return [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.address_1,
    address.address_2,
    [address.city, address.state, address.postcode].filter(Boolean).join(", "),
    address.country === "BD" ? "Bangladesh" : address.country,
    includeContact ? address.phone : "",
    includeContact ? address.email : "",
  ].filter(Boolean);
}

function metaLine(meta = []) {
  return meta
    .filter((entry) => entry?.key && entry?.value && !String(entry.key).startsWith("_"))
    .map((entry) => `${entry.display_key || entry.key}: ${entry.display_value || entry.value}`)
    .join(", ");
}

function OrderTimeline({ order }) {
  const currentStatus = order?.status || "pending";
  const isTerminal = terminalStatuses.includes(currentStatus);

  if (isTerminal) {
    return (
      <div className="alert alert-warning mb-35">
        Current status: <strong>{order.statusLabel || statusLabel(currentStatus)}</strong>. Please contact us if you need help with this order.
      </div>
    );
  }

  return (
    <div className="tp-order-timeline mb-45">
      <div className="row gy-4">
        {timelineSteps.map((step) => {
          const active = step.statuses.includes(currentStatus);
          return (
            <div className="col-lg-3 col-sm-6" key={step.key}>
              <div
                className={`tp-order-timeline-item ${active ? "is-active" : ""}`}
                style={{
                  border: active ? "1px solid #bd844c" : "1px solid #e4e4e4",
                  background: active ? "#fff7ef" : "#fff",
                  padding: "22px 18px",
                  height: "100%",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 34,
                    height: 34,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    marginBottom: 12,
                    color: active ? "#fff" : "#555",
                    background: active ? "#bd844c" : "#efefef",
                  }}
                >
                  {active ? "✓" : "•"}
                </span>
                <h5 className="mb-10">{step.title}</h5>
                <p className="mb-0">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileOrderTimeline({ order }) {
  const currentStatus = order?.status || "pending";
  const terminal = terminalStatuses.includes(currentStatus);

  return (
    <div className="gs-order-progress">
      {timelineSteps.map((step, index) => {
        const done = !terminal && step.statuses.includes(currentStatus);
        const current = !terminal && currentStatus === step.key;
        return (
          <div className={`gs-order-progress-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}`} key={step.key}>
            <span>{done ? <i className="fa-regular fa-check" aria-hidden="true"></i> : index + 1}</span>
            <small>{step.title}</small>
          </div>
        );
      })}
    </div>
  );
}

function GuestOrderFallback({ orderId }) {
  return (
    <div className="invoice__wrapper gs-guest-order grey-bg-2 pt-60 pb-60 pl-40 pr-40 text-center">
      <p className="text-black alert alert-success mb-30">
        Thank you. Your order has been received.
      </p>
      <h3 className="mb-15">Order #{orderId}</h3>
      <p className="mb-10">
        <strong>Payment Method:</strong> Cash on Delivery
      </p>
      <p className="mb-35">
        Log in to your account to view detailed order tracking, delivery address, and item summary.
      </p>
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <Link href="/login" className="tp-btn">
          Login to View Details
        </Link>
        <Link href="/shop" className="tp-btn tp-btn-border">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function MobileOrderDetails({ order }) {
  const billingLines = addressLines(order.billing, true);
  const shippingLines = addressLines(order.shipping);
  const shippingMethod = order.shippingLines?.[0]?.method_title || "Cash on Delivery Shipping";
  const currentStatus = order.status || "pending";
  const activeStep = timelineSteps.find((step) => step.key === currentStatus) || timelineSteps.find((step) => step.statuses.includes(currentStatus));

  return (
    <div className="gs-mobile-order-detail d-md-none">
      <header className="gs-order-hero">
        <div>
          <span>Order Details</span>
          <h1>Order #{order.number || order.id}</h1>
          <p>Placed {formatDate(order.createdAt)}</p>
        </div>
        <div>
          <span className={`gs-order-status gs-status-${currentStatus}`}>{order.statusLabel || statusLabel(currentStatus)}</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </header>

      <MobileOrderTimeline order={order} />

      <div className="gs-order-notice">
        <strong>{activeStep?.description || `Current status: ${statusLabel(currentStatus)}.`}</strong>
        {!terminalStatuses.includes(currentStatus) && " We will update you as your order moves forward."}
      </div>

      <section className="gs-order-section">
        <h2>Items in this Order</h2>
        {(order.lineItems || []).map((item) => (
          <article className="gs-order-product" key={item.id}>
            <div className="gs-order-product-image">
              {item.image?.src ? <Image src={item.image.src} alt="" width={64} height={64} /> : <i className="fa-light fa-gem" aria-hidden="true"></i>}
            </div>
            <div>
              <h3>{item.name}</h3>
              <p>{[metaLine(item.meta_data), `Qty: ${item.quantity}`].filter(Boolean).join(" · ")}</p>
            </div>
            <strong>{formatPrice(item.total)}</strong>
          </article>
        ))}
      </section>

      <section className="gs-order-meta">
        <h2>Payment &amp; Delivery</h2>
        <dl>
          <div><dt>Payment Method</dt><dd>{order.paymentMethod || "Cash on Delivery"}</dd></div>
          <div><dt>Payment Status</dt><dd>{order.datePaid ? "Paid" : "Not yet collected"}</dd></div>
          <div><dt>Delivery Type</dt><dd>{shippingMethod}</dd></div>
          <div><dt>Shipping Charge</dt><dd>{formatPrice(order.shippingTotal)}</dd></div>
          <div><dt>Last Updated</dt><dd>{formatDate(order.dateModified)}</dd></div>
        </dl>
      </section>

      <section className="gs-order-addresses">
        <div><h2>Billing</h2>{billingLines.map((line) => <p key={line}>{line}</p>)}</div>
        <div><h2>Shipping</h2>{shippingLines.map((line) => <p key={line}>{line}</p>)}</div>
      </section>

      {order.customerNote && <section className="gs-order-meta"><h2>Order Note</h2><p>{order.customerNote}</p></section>}

      <section className="gs-order-summary-block">
        <h2>Order Summary</h2>
        <dl>
          <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>{formatPrice(order.shippingTotal)}</dd></div>
          <div><dt>Discount</dt><dd>-{formatPrice(order.discountTotal)}</dd></div>
          <div><dt>Tax</dt><dd>{formatPrice(order.taxTotal)}</dd></div>
        </dl>
        <div><span>Total Payable</span><strong>{formatPrice(order.total)}</strong></div>
      </section>

      <div className="gs-order-actions">
        <Link href="/profile?section=orders" className="tp-btn tp-btn-border"><i className="fa-regular fa-arrow-left" aria-hidden="true"></i> Back</Link>
        <Link href="/contact" className="tp-btn">Need Help?</Link>
      </div>
    </div>
  );
}

function OrderDetails({ order }) {
  const billingLines = addressLines(order.billing, true);
  const shippingLines = addressLines(order.shipping);
  const shippingMethod = order.shippingLines?.[0]?.method_title || "Cash on Delivery Shipping";

  return (
    <div className="invoice__wrapper gs-order-desktop d-none d-md-block grey-bg-2 pt-50 pb-50 pl-40 pr-40">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-35">
        <div>
          <span className="text-uppercase" style={{ letterSpacing: 1, fontSize: 12 }}>
            Order Details
          </span>
          <h3 className="mb-10">Order #{order.number || order.id}</h3>
          <p className="mb-0">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-sm-end">
          <span className="alert alert-success d-inline-block mb-10">
            {order.statusLabel || statusLabel(order.status)}
          </span>
          <h4 className="mb-0">{formatPrice(order.total)}</h4>
        </div>
      </div>

      <OrderTimeline order={order} />

      <div className="row gy-4 mb-40">
        <div className="col-lg-4">
          <div className="bg-white p-4 h-100">
            <h5 className="mb-15">Payment</h5>
            <p className="mb-5">{order.paymentMethod || "Cash on Delivery"}</p>
            <p className="mb-0">Paid: {order.datePaid ? formatDate(order.datePaid) : "Not paid yet"}</p>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="bg-white p-4 h-100">
            <h5 className="mb-15">Delivery</h5>
            <p className="mb-5">{shippingMethod}</p>
            <p className="mb-0">Shipping: {formatPrice(order.shippingTotal)}</p>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="bg-white p-4 h-100">
            <h5 className="mb-15">Last Update</h5>
            <p className="mb-0">{formatDate(order.dateModified)}</p>
          </div>
        </div>
      </div>

      <div className="profile__ticket table-responsive mb-40">
        <table className="table bg-white">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">SKU</th>
              <th scope="col">Qty</th>
              <th scope="col">Price</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.lineItems || []).map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  {metaLine(item.meta_data) && (
                    <p className="mb-0 mt-1">{metaLine(item.meta_data)}</p>
                  )}
                </td>
                <td>{item.sku || "-"}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.price)}</td>
                <td>{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row gy-4">
        <div className="col-lg-7">
          <div className="row gy-4">
            <div className="col-md-6">
              <div className="bg-white p-4 h-100">
                <h5 className="mb-15">Billing Details</h5>
                {billingLines.map((line) => (
                  <p className="mb-1" key={line}>{line}</p>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <div className="bg-white p-4 h-100">
                <h5 className="mb-15">Shipping Address</h5>
                {shippingLines.map((line) => (
                  <p className="mb-1" key={line}>{line}</p>
                ))}
              </div>
            </div>
            {order.customerNote && (
              <div className="col-12">
                <div className="bg-white p-4">
                  <h5 className="mb-10">Order Note</h5>
                  <p className="mb-0">{order.customerNote}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="bg-white p-4">
            <h5 className="mb-20">Order Summary</h5>
            <div className="d-flex justify-content-between mb-10">
              <span>Subtotal</span>
              <strong>{formatPrice(order.subtotal)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-10">
              <span>Shipping</span>
              <strong>{formatPrice(order.shippingTotal)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-10">
              <span>Discount</span>
              <strong>-{formatPrice(order.discountTotal)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-10">
              <span>Tax</span>
              <strong>{formatPrice(order.taxTotal)}</strong>
            </div>
            {(order.couponLines || []).map((coupon) => (
              <div className="d-flex justify-content-between mb-10" key={coupon.id || coupon.code}>
                <span>Coupon: {coupon.code}</span>
                <strong>-{formatPrice(coupon.discount)}</strong>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between">
              <span>Total</span>
              <h4 className="mb-0">{formatPrice(order.total)}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3 flex-wrap mt-45">
        <Link href="/profile" className="tp-btn">
          Back to Account
        </Link>
        <Link href="/contact" className="tp-btn tp-btn-border">
          Need Help?
        </Link>
      </div>
    </div>
  );
}

const SingleOrder = ({ params }) => {
  const orderId = params.id;
  const { accessToken } = useSelector((state) => state.auth);
  const { data: order, isLoading, isError, error } = useGetUserOrderByIdQuery(
    accessToken && orderId ? orderId : skipToken
  );

  return (
    <Wrapper>
      <SEO pageTitle={order ? `Order #${order.number || order.id}` : "Order Details"} />
      <HeaderTwo style_2={true} />
      <main id="main-content" tabIndex="-1" className="gs-order-page-shell">
        <CommonBreadcrumb title="Order Details" subtitle="Account" center={true} />
        <section className="invoice__area pt-120 pb-120">
        <div className="container">
          {!accessToken && <GuestOrderFallback orderId={orderId} />}
          {accessToken && isLoading && (
            <div className="invoice__wrapper grey-bg-2 pt-60 pb-60 pl-40 pr-40 text-center">
              <p className="mb-0">Loading order details...</p>
            </div>
          )}
          {accessToken && isError && (
            <div className="invoice__wrapper grey-bg-2 pt-60 pb-60 pl-40 pr-40 text-center">
              <p className="alert alert-warning mb-30">
                {error?.data?.message || "Unable to load this order."}
              </p>
              <Link href="/profile" className="tp-btn">
                Back to Account
              </Link>
            </div>
          )}
          {accessToken && order && <><MobileOrderDetails order={order} /><OrderDetails order={order} /></>}
        </div>
        </section>
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default SingleOrder;
