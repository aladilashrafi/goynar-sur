const WOO_URL = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WOO_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOO_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function assertWooConfig() {
  const missing = [];
  if (!WOO_URL) missing.push("WOOCOMMERCE_URL");
  if (!WOO_KEY) missing.push("WOOCOMMERCE_CONSUMER_KEY");
  if (!WOO_SECRET) missing.push("WOOCOMMERCE_CONSUMER_SECRET");

  if (missing.length) {
    throw new Error(`Missing WooCommerce environment variables: ${missing.join(", ")}`);
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

export async function wcFetch(path, options = {}) {
  assertWooConfig();

  const { method = "GET", params = {}, body, headers = {} } = options;
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBaseUrl(WOO_URL)}/wp-json/wc/v3${endpoint}${buildQuery(params)}`;

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const origin = new URL(url).origin;
    throw new Error(`Unable to reach WooCommerce at ${origin}: ${error.message}`);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.message || text || response.statusText;
    throw new Error(`WooCommerce ${response.status} ${response.statusText} on ${endpoint}: ${detail}`);
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
