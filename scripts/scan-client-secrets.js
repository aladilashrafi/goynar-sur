const fs = require("fs");
const path = require("path");
const { loadEnv } = require("./env-utils");

const env = loadEnv();
const clientStaticDir = path.join(process.cwd(), ".next", "static");

const secretKeys = [
  "WOOCOMMERCE_CONSUMER_KEY",
  "WOOCOMMERCE_CONSUMER_SECRET",
  "JWT_AUTH_SECRET_KEY",
];

const forbiddenNames = [
  "WOOCOMMERCE_CONSUMER_KEY",
  "WOOCOMMERCE_CONSUMER_SECRET",
  "JWT_AUTH_SECRET_KEY",
  "NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY",
  "NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET",
  "NEXT_PUBLIC_JWT_AUTH_SECRET_KEY",
];

const secretValues = secretKeys
  .map((key) => String(env[key] || "").trim())
  .filter((value) => value.length >= 8);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

const files = walk(clientStaticDir).filter((filePath) => /\.(js|css|json|html|txt|map)$/.test(filePath));
const leaks = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const value of secretValues) {
    if (content.includes(value)) {
      leaks.push(`${path.relative(process.cwd(), filePath)} contains a server secret value`);
    }
  }

  for (const name of forbiddenNames) {
    if (content.includes(name)) {
      leaks.push(`${path.relative(process.cwd(), filePath)} references ${name}`);
    }
  }
}

if (leaks.length) {
  console.error("Potential client secret exposure detected:");
  leaks.forEach((leak) => console.error(`- ${leak}`));
  process.exit(1);
}

console.log("Client bundle secret scan passed.");
