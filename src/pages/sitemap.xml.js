import { getCategories, getProducts } from "@/lib/woocommerce";
import { absoluteUrl } from "@/utils/seo";

const STATIC_PATHS = ["/", "/shop", "/contact", "/cart", "/checkout"];

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry({ loc, lastmod, changefreq = "weekly", priority = "0.7" }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n");
}

function buildSitemap(entries = []) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const now = new Date().toISOString();
  const entries = STATIC_PATHS.map((path) => ({
    loc: absoluteUrl(path),
    lastmod: now,
    changefreq: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? "1.0" : "0.7",
  }));

  try {
    const [{ products }, categories] = await Promise.all([
      getProducts({ per_page: 100, status: "publish" }),
      getCategories({ per_page: 100, hide_empty: true }),
    ]);

    products.forEach((product) => {
      const slug = product.slug || product.id;
      if (!slug) return;

      entries.push({
        loc: absoluteUrl(`/product/${slug}`),
        lastmod: product.date_modified_gmt
          ? `${product.date_modified_gmt.replace(" ", "T")}Z`
          : now,
        changefreq: "weekly",
        priority: "0.8",
      });
    });

    categories.forEach((category) => {
      if (!category.slug) return;

      entries.push({
        loc: absoluteUrl(`/product-category/${category.slug}`),
        lastmod: now,
        changefreq: "weekly",
        priority: "0.6",
      });
    });
  } catch (error) {
    // Keep the sitemap route available even if WooCommerce is temporarily unreachable.
  }

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.write(buildSitemap(entries));
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
