import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

function readRepoFile(filePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), filePath), "utf8").trim();
}

function readJsonFile(filePath: string): Record<string, unknown> {
  return JSON.parse(readRepoFile(filePath)) as Record<string, unknown>;
}

describe("Cloudflare production build contract", () => {
  it("pins the build image to the Node 22 runtime required by current tooling", () => {
    const packageJson = readJsonFile("package.json");
    const engines = packageJson.engines as Record<string, unknown>;

    assert.equal(readRepoFile(".nvmrc"), "22");
    assert.equal(readRepoFile(".node-version"), "22");
    assert.equal(engines.node, ">=22 <23");
  });

  it("provides the Wrangler config used by the production deploy command", () => {
    const wranglerConfig = readJsonFile("wrangler.production.jsonc");
    const assets = wranglerConfig.assets as Record<string, unknown>;
    const observability = wranglerConfig.observability as Record<string, unknown>;

    assert.equal(wranglerConfig.name, "gogocash-landing-production");
    assert.equal(wranglerConfig.main, "workers/production-geo-locale.ts");
    assert.equal(wranglerConfig.account_id, "187ab61ed9dbc6e616cb23e6b95aa8f1");
    assert.equal(assets.directory, "./out");
    assert.equal(assets.not_found_handling, "404-page");

    assert.deepEqual(observability, {
      enabled: false,
      head_sampling_rate: 1,
      logs: {
        enabled: true,
        head_sampling_rate: 1,
        persist: true,
        invocation_logs: true,
      },
      traces: {
        enabled: false,
        persist: true,
        head_sampling_rate: 1,
      },
    });
  });
});
