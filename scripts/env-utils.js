const fs = require("fs");
const path = require("path");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return env;

      const separator = trimmed.indexOf("=");
      if (separator === -1) return env;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
}

function loadEnv() {
  const cwd = process.cwd();
  const localEnv = parseEnvFile(path.join(cwd, ".env.local"));
  const productionEnv = parseEnvFile(path.join(cwd, ".env.production"));

  return {
    ...localEnv,
    ...productionEnv,
    ...process.env,
  };
}

module.exports = {
  loadEnv,
};
