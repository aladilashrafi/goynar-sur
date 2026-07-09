const DEFAULT_SITE_URL = "https://goynarsur.com";
const DEFAULT_DESCRIPTION =
  "Shop handmade jewellery from Goynar Sur with Cash on Delivery across Bangladesh.";
const DEFAULT_IMAGE = "/assets/img/logo/goynar-sur-logo.png";

export const SITE_NAME = "Goynar Sur";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
export const DEFAULT_SEO_DESCRIPTION = DEFAULT_DESCRIPTION;
export const DEFAULT_OG_IMAGE = DEFAULT_IMAGE;

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(value = "", maxLength = 155) {
  const clean = stripHtml(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}...`;
}

export function productCanonicalPath(product = {}) {
  const slug = product.slug || product.raw?.slug || product.id || product._id;
  return slug ? `/product/${slug}` : "/shop";
}

export function productSeoDescription(product = {}) {
  return (
    truncateText(product.shortDescription || product.description || product.plainDescription) ||
    DEFAULT_DESCRIPTION
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(DEFAULT_IMAGE),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    sameAs: [],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": `${SITE_URL}/#local-business`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_IMAGE),
    priceRange: "BDT",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash on Delivery",
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
  };
}

export function productSchema(product = {}) {
  const price = Number(product.salePrice || product.price || product.regularPrice || 0);
  const images = (product.imageURLs || [])
    .map((image) => image?.img)
    .filter(Boolean)
    .map(absoluteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(productCanonicalPath(product))}#product`,
    name: product.title,
    image: images.length ? images : [absoluteUrl(product.img || DEFAULT_IMAGE)],
    description: productSeoDescription(product),
    sku: product.sku || String(product.id || product._id || ""),
    brand: {
      "@type": "Brand",
      name: product.brand?.name || SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productCanonicalPath(product)),
      priceCurrency: "BDT",
      price: Number.isFinite(price) ? price.toFixed(2) : "0.00",
      availability:
        product.status === "out-of-stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
  };
}

export function productBreadcrumbSchema(product = {}) {
  const categoryName = product.category?.name || product.parent || "Shop";
  const categorySlug = product.category?.slug;
  const categoryPath = categorySlug ? `/product-category/${categorySlug}` : "/shop";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: absoluteUrl(categoryPath),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title || "Product",
        item: absoluteUrl(productCanonicalPath(product)),
      },
    ],
  };
}

export function compactJsonLd(schema) {
  if (!schema) return null;
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
