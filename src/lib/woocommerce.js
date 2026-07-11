import { apiError } from "./api-error";

const WOO_URL = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WOO_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOO_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const REQUEST_TIMEOUT_MS = 12000;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const REVIEW_SUMMARY_TTL_MS = 60_000;
let reviewSummaryCache = null;
let reviewSummaryCacheExpiresAt = 0;

function assertWooConfig() {
  const missing = [];
  if (!WOO_URL) missing.push("WOOCOMMERCE_URL");
  if (!WOO_KEY) missing.push("WOOCOMMERCE_CONSUMER_KEY");
  if (!WOO_SECRET) missing.push("WOOCOMMERCE_CONSUMER_SECRET");

  if (missing.length) {
    throw apiError(
      `Missing WooCommerce environment variables: ${missing.join(", ")}`,
      503,
      "missing_env"
    );
  }
}

function cleanBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      search.set(key, value.join(","));
      return;
    }
    search.set(key, String(value));
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function authHeader() {
  return `Basic ${Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString("base64")}`;
}

function retryDelay(response, attempt) {
  const retryAfter = Number(response?.headers?.get("Retry-After") || 0);
  if (retryAfter > 0) return Math.min(retryAfter * 1000, 2500);
  return 350 * (attempt + 1);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJson(text, endpoint) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    throw apiError(`WooCommerce returned invalid JSON for ${endpoint}.`, 502, "invalid_upstream_json");
  }
}

export async function wcFetch(path, options = {}) {
  assertWooConfig();

  const { method = "GET", params = {}, body, headers = {} } = options;
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBaseUrl(WOO_URL)}/wp-json/wc/v3${endpoint}${buildQuery(params)}`;
  const maxAttempts = method === "GET" ? 2 : 1;

  let response;
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        await wait(350 * (attempt + 1));
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }

    if (response && RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts - 1) {
      await wait(retryDelay(response, attempt));
      continue;
    }

    break;
  }

  if (!response) {
    const origin = new URL(url).origin;
    throw apiError(
      `Unable to reach WooCommerce at ${origin}: ${lastError?.message || "request failed"}`,
      503,
      "upstream_unreachable"
    );
  }

  const text = await response.text();
  const data = await parseJson(text, endpoint);

  if (!response.ok) {
    const detail = data?.message || text || response.statusText;
    const code = data?.code || (response.status === 429 ? "rate_limited" : "upstream_error");
    throw apiError(`WooCommerce ${response.status} ${response.statusText} on ${endpoint}: ${detail}`, response.status, code);
  }

  return {
    data,
    total: Number(response.headers.get("X-WP-Total") || 0),
    totalPages: Number(response.headers.get("X-WP-TotalPages") || 0),
  };
}

export async function getProducts(params = {}) {
  const { data, total, totalPages } = await wcFetch("/products", {
    params: {
      status: "publish",
      per_page: 20,
      ...params,
    },
  });

  return { products: data, count: total || data.length, totalPages };
}

export async function getProductById(id) {
  const { data } = await wcFetch(`/products/${id}`);
  return data;
}

export async function getProductBySlug(slug) {
  const { data } = await wcFetch("/products", {
    params: {
      slug,
      per_page: 1,
      status: "publish",
    },
  });

  return Array.isArray(data) ? data[0] : null;
}

export async function getProductReviews(productId, params = {}) {
  const { data, total, totalPages } = await wcFetch("/products/reviews", {
    params: {
      product: productId,
      status: "approved",
      per_page: 20,
      order: "desc",
      orderby: "date_gmt",
      ...params,
    },
  });

  return { reviews: Array.isArray(data) ? data : [], count: total || data?.length || 0, totalPages };
}

export async function getProductReviewSummaries() {
  if (reviewSummaryCache && Date.now() < reviewSummaryCacheExpiresAt) {
    return reviewSummaryCache;
  }

  const firstPage = await wcFetch("/products/reviews", {
    params: {
      status: "approved",
      per_page: 100,
      page: 1,
      order: "desc",
      orderby: "date_gmt",
    },
  });
  const remainingPages = Array.from(
    { length: Math.max(0, firstPage.totalPages - 1) },
    (_, index) => index + 2
  );
  const pageResults = await Promise.all(
    remainingPages.map((page) =>
      wcFetch("/products/reviews", {
        params: { status: "approved", per_page: 100, page },
      })
    )
  );
  const reviews = [
    ...(Array.isArray(firstPage.data) ? firstPage.data : []),
    ...pageResults.flatMap((result) => (Array.isArray(result.data) ? result.data : [])),
  ];
  const summaries = {};

  reviews.forEach((review) => {
    const productId = Number(review.product_id);
    const rating = Number(review.rating) || 0;
    if (!productId || rating <= 0) return;

    const current = summaries[productId] || { ratingTotal: 0, ratingCount: 0 };
    current.ratingTotal += rating;
    current.ratingCount += 1;
    summaries[productId] = current;
  });

  Object.values(summaries).forEach((summary) => {
    summary.averageRating = summary.ratingTotal / summary.ratingCount;
  });

  reviewSummaryCache = summaries;
  reviewSummaryCacheExpiresAt = Date.now() + REVIEW_SUMMARY_TTL_MS;
  return summaries;
}

export async function createProductReview(input = {}) {
  const { data } = await wcFetch("/products/reviews", {
    method: "POST",
    body: input,
  });

  reviewSummaryCache = null;
  reviewSummaryCacheExpiresAt = 0;
  return data;
}

export async function getProductVariations(productId, params = {}) {
  const { data } = await wcFetch(`/products/${productId}/variations`, {
    params: {
      per_page: 100,
      ...params,
    },
  });

  return data;
}

export async function getProductAttributeTerms(attributeId) {
  const { data } = await wcFetch(`/products/attributes/${attributeId}/terms`, {
    params: {
      per_page: 100,
    },
  });

  return data;
}

export async function getProductsByIds(ids = []) {
  const cleanIds = ids.map(Number).filter(Boolean);
  if (!cleanIds.length) return [];

  const { data } = await wcFetch("/products", {
    params: {
      include: cleanIds,
      per_page: cleanIds.length,
      status: "publish",
    },
  });

  return data;
}

export async function getCategories(params = {}) {
  const { data } = await wcFetch("/products/categories", {
    params: {
      per_page: 100,
      ...params,
    },
  });

  return data;
}
