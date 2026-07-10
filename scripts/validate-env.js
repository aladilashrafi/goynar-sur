const { loadEnv } = require("./env-utils");

const env = loadEnv();

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "WOOCOMMERCE_URL",
  "WOOCOMMERCE_CONSUMER_KEY",
  "WOOCOMMERCE_CONSUMER_SECRET",
  "NEXT_PUBLIC_BRAND_NAME",
  "NEXT_PUBLIC_CURRENCY_SYMBOL",
];

const forbiddenPublic = [
  "NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY",
  "NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET",
  "NEXT_PUBLIC_JWT_AUTH_SECRET_KEY",
  "NEXT_PUBLIC_JWT_SECRET",
];

const missing = required.filter((key) => !String(env[key] || "").trim());
const exposed = forbiddenPublic.filter((key) => String(env[key] || "").trim());

if (missing.length || exposed.length) {
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (exposed.length) {
    console.error(`Server-only secrets must not use NEXT_PUBLIC_: ${exposed.join(", ")}`);
  }

  process.exit(1);
}

console.log("Environment validation passed.");
