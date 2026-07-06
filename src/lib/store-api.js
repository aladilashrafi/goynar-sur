const STORE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_URL;

function cleanBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function assertStoreConfig() {
  if (!STORE_URL) {
    throw new Error("NEXT_PUBLIC_WORDPRESS_URL or WOOCOMMERCE_URL is required for WooCommerce Store API calls.");
  }
}

function storeApiUrl(path) {
  assertStoreConfig();
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBaseUrl(STORE_URL)}/wp-json/wc/store/v1${endpoint}`;
}

function responseSessionHeaders(response, fallback = {}) {
  return {
    cartToken: response.headers.get("cart-token") || fallback.cartToken || "",
    nonce:
      response.headers.get("nonce") ||
      response.headers.get("x-wc-store-api-nonce") ||
      fallback.nonce ||
      "",
  };
}

async function parseStoreResponse(response, endpoint) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `WooCommerce Store API ${response.status} on ${endpoint}`);
  }

  return data;
}

export async function storeFetch(path, options = {}) {
  const { method = "GET", body, session = {} } = options;
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const headers = {
    "Content-Type": "application/json",
  };

  if (session.cartToken) headers["Cart-Token"] = session.cartToken;
  if (session.nonce) headers.Nonce = session.nonce;

  const response = await fetch(storeApiUrl(endpoint), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await parseStoreResponse(response, endpoint);

  return {
    data,
    session: responseSessionHeaders(response, session),
  };
}

export async function createStoreCartSession() {
  return storeFetch("/cart");
}
