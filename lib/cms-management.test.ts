import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

function readJson<T>(...segments: string[]): T {
  return JSON.parse(readFileSync(join(process.cwd(), ...segments), "utf8")) as T;
}

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
};

describe("CMS management wiring", () => {
  it("exposes root commands for local Strapi management", () => {
    const pkg = readJson<PackageJson>("package.json");
    assert.equal(pkg.scripts?.["cms:env"], "node scripts/create-cms-env.mjs");
    assert.equal(pkg.scripts?.["cms:install"], "npm --prefix cms/strapi install");
    assert.equal(pkg.scripts?.["cms:dev"], "npm --prefix cms/strapi run develop");
    assert.equal(
      pkg.scripts?.["cms:docker"],
      "docker compose --profile cms up --build cms postgres",
    );
    assert.equal(pkg.scripts?.["cms:seed"], "npm run learn:strapi-push");
  });

  it("keeps the Strapi app pinned to the expected major version", () => {
    const pkg = readJson<PackageJson>("cms", "strapi", "package.json");
    assert.equal(pkg.dependencies?.["@strapi/strapi"], "5.48.1");
    assert.equal(pkg.dependencies?.["@strapi/plugin-users-permissions"], "5.48.1");
    assert.equal(pkg.dependencies?.["better-sqlite3"], "12.11.1");
    assert.equal(pkg.dependencies?.["pg"], "8.16.3");
  });

  it("includes local admin runtime requirements", () => {
    const adminConfig = readFileSync(
      join(process.cwd(), "cms", "strapi", "config", "admin.ts"),
      "utf8",
    );
    const envGenerator = readFileSync(
      join(process.cwd(), "scripts", "create-cms-env.mjs"),
      "utf8",
    );

    assert.match(adminConfig, /encryptionKey: env\("ENCRYPTION_KEY"\)/);
    assert.match(envGenerator, /ENCRYPTION_KEY=\$\{secret\(\)\}/);
    assert.equal(
      existsSync(join(process.cwd(), "cms", "strapi", "favicon.png")),
      true,
    );
  });
});
