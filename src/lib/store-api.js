import { apiError } from "./api-error";

const STORE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_URL;
const REQUEST_TIMEOUT_MS = 12000;

function cleanBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function assertStoreConfig() {
  if (!STORE_URL) {
    throw apiError("WooCommerce Store API URL is not configured.", 503, "missing_env");
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
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    throw apiError(`WooCommerce Store API returned invalid JSON for ${endpoint}.`, 502, "invalid_upstream_json");
  }

  if (!response.ok) {
    throw apiError(
      data?.message || `WooCommerce Store API ${response.status} on ${endpoint}`,
      response.status,
      data?.code || (response.status === 429 ? "rate_limited" : "store_api_error")
    );
  }

  return data;
}

export async function storeFetch(path, options = {}) {
  const { method = "GET", body, session = {} } = options;
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    "Content-Type": "application/json",
  };

  if (session.cartToken) headers["Cart-Token"] = session.cartToken;
  if (session.nonce) headers.Nonce = session.nonce;

  let response;

  try {
    response = await fetch(storeApiUrl(endpoint), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    throw apiError(
      `Unable to reach WooCommerce Store API: ${error.message}`,
      503,
      "upstream_unreachable"
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = await parseStoreResponse(response, endpoint);

  return {
    data,
    session: responseSessionHeaders(response, session),
  };
}

export async function createStoreCartSession() {
  return storeFetch("/cart");
}
