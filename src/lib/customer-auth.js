import { wcFetch } from "@/lib/woocommerce";

const WORDPRESS_URL = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
const REST_NAMESPACE = "goynar-sur/v1";

export class CustomerAuthError extends Error {
  constructor(message, status = 400, code = undefined) {
    super(message);
    this.name = "CustomerAuthError";
    this.status = status;
    this.code = code;
  }
}

function assertWordPressConfig() {
  if (!WORDPRESS_URL) {
    throw new CustomerAuthError("WordPress URL is not configured.", 503);
  }
}

function cleanBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function wpRestUrl(path) {
  assertWordPressConfig();
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBaseUrl(WORDPRESS_URL)}/wp-json/${REST_NAMESPACE}${endpoint}`;
}

async function parseJsonResponse(response, fallbackMessage) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new CustomerAuthError(
      data?.message || fallbackMessage,
      response.status,
      data?.code
    );
  }

  return data;
}

async function goynarFetch(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(wpRestUrl(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    throw new CustomerAuthError(
      `Unable to reach the Goynar Sur WordPress auth service: ${error.message}`,
      503
    );
  }

  return parseJsonResponse(response, "The account request could not be completed.");
}

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function normalizeUser(user = {}) {
  return {
    id: user.id,
    _id: user.id,
    email: user.email || "",
    name:
      user.name ||
      user.displayName ||
      user.display_name ||
      [user.firstName || user.first_name, user.lastName || user.last_name].filter(Boolean).join(" ") ||
      "Goynar Sur Customer",
    username: user.username || user.nicename || "",
    phone: user.phone || user.billing?.phone || "",
    customer: user.customer || user,
  };
}

export async function loginCustomer(email, password) {
  const data = await goynarFetch("/auth/token", {
    method: "POST",
    body: {
      username: email,
      password,
    },
  });

  return {
    accessToken: data.token,
    token: data.token,
    user: normalizeUser(data.user),
    expiresAt: data.expires_at,
  };
}

export async function registerCustomer(input = {}) {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const fullName = input.fullName || input.name || "";
  const { firstName, lastName } = splitName(fullName);

  if (!firstName || !email || !password) {
    throw new CustomerAuthError("Name, email, and password are required.", 400);
  }

  await wcFetch("/customers", {
    method: "POST",
    body: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: input.phone || "",
        country: "BD",
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        country: "BD",
      },
    },
  });

  return loginCustomer(email, password);
}

export async function getCustomerFromToken(token) {
  const data = await goynarFetch("/account/profile", { token });
  return normalizeUser(data.customer || {});
}

function mapWooOrder(order = {}) {
  const status = order.status || "pending";

  return {
    _id: String(order.id),
    id: order.id,
    number: order.number || String(order.id),
    createdAt: order.date_created || order.date_created_gmt || "",
    dateCreated: order.date_created || order.date_created_gmt || "",
    status,
    statusLabel: status
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    total: order.total,
    currency: order.currency || "BDT",
    paymentMethod: order.payment_method_title || order.payment_method || "Cash on Delivery",
    lineItems: order.line_items || [],
    billing: order.billing || {},
    shipping: order.shipping || {},
  };
}

function orderStats(orders = []) {
  return orders.reduce(
    (stats, order) => {
      stats.totalDoc += 1;

      if (["pending", "on-hold"].includes(order.status)) {
        stats.pending += 1;
      }

      if (["processing"].includes(order.status)) {
        stats.processing += 1;
      }

      if (["completed"].includes(order.status)) {
        stats.delivered += 1;
      }

      return stats;
    },
    {
      totalDoc: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
    }
  );
}

export async function getCustomerOrders(token) {
  const user = await getCustomerFromToken(token);

  async function fetchOrders(params = {}) {
    const { data } = await wcFetch("/orders", {
      params: {
        per_page: 25,
        orderby: "date",
        order: "desc",
        ...params,
      },
    });

    return Array.isArray(data) ? data : [];
  }

  const [customerOrders, emailOrders] = await Promise.all([
    user.id ? fetchOrders({ customer: user.id }).catch(() => []) : Promise.resolve([]),
    user.email ? fetchOrders({ search: user.email }).catch(() => []) : Promise.resolve([]),
  ]);

  const merged = new Map();

  customerOrders.forEach((order) => {
    merged.set(order.id, order);
  });

  emailOrders.forEach((order) => {
    const billingEmail = order.billing?.email?.trim().toLowerCase();
    if (billingEmail && billingEmail === user.email.trim().toLowerCase()) {
      merged.set(order.id, order);
    }
  });

  const orders = Array.from(merged.values())
    .sort((left, right) => {
      return new Date(right.date_created || 0).getTime() - new Date(left.date_created || 0).getTime();
    })
    .map(mapWooOrder);

  return {
    orders,
    ...orderStats(orders),
  };
}

export async function validateCustomerToken(token) {
  await goynarFetch("/auth/token/validate", { token });
  return true;
}

export async function requestCustomerPasswordReset(email) {
  const data = await goynarFetch("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

  return data.message || "If that email exists, we sent password reset instructions.";
}

export async function resetCustomerPassword(input = {}) {
  const data = await goynarFetch("/auth/reset-password", {
    method: "POST",
    body: {
      email: input.email,
      token: input.token,
      password: input.password,
    },
  });

  return data.message || "Your password has been updated.";
}

export async function updateCustomerProfile(token, input = {}) {
  const data = await goynarFetch("/account/profile", {
    method: "PATCH",
    token,
    body: input,
  });

  return normalizeUser(data.customer || {});
}

export async function getCustomerWishlist(token) {
  const data = await goynarFetch("/account/wishlist", { token });
  return data.entries || [];
}

export async function addCustomerWishlistProduct(token, productId) {
  const data = await goynarFetch("/account/wishlist", {
    method: "POST",
    token,
    body: { product_id: productId },
  });

  return data.entries || [];
}

export async function removeCustomerWishlistProduct(token, productId) {
  const data = await goynarFetch("/account/wishlist", {
    method: "DELETE",
    token,
    body: { product_id: productId },
  });

  return data.entries || [];
}
