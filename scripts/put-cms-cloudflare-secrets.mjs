#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const config = "wrangler.cms.jsonc";
const requiredSecrets = [
  "DATABASE_URL",
  "APP_KEYS",
  "API_TOKEN_SALT",
  "ADMIN_JWT_SECRET",
  "TRANSFER_TOKEN_SALT",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
];

const missing = requiredSecrets.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required CMS secret env vars: ${missing.join(", ")}`);
  process.exit(1);
}

for (const name of requiredSecrets) {
  const result = spawnSync(
    "npm",
    ["exec", "--", "wrangler", "secret", "put", name, "--config", config],
    {
      input: process.env[name],
      stdio: ["pipe", "inherit", "inherit"],
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
