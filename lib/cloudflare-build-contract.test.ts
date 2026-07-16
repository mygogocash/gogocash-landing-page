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
    assert.match(readRepoFile("Dockerfile.dev"), /^FROM node:22-/m);
    for (const script of ["scripts/dev-local.sh", "scripts/start-dev.sh"]) {
      const source = readRepoFile(script);
      assert.match(source, /REQUIRED_NODE_MAJOR=22/);
      assert.match(source, /-ne "\$\{REQUIRED_NODE_MAJOR\}"/);
    }
  });

  it("provides the Wrangler config used by the production deploy command", () => {
    const wranglerConfig = readJsonFile("wrangler.production.jsonc");
    const assets = wranglerConfig.assets as Record<string, unknown>;
    const observability = wranglerConfig.observability as Record<string, unknown>;

    assert.equal(wranglerConfig.name, "gogocash-landing-production");
    assert.equal(wranglerConfig.main, "workers/production-geo-locale.ts");
    assert.equal(wranglerConfig.account_id, "187ab61ed9dbc6e616cb23e6b95aa8f1");
    assert.equal(assets.binding, "ASSETS");
    assert.equal(assets.directory, "./out");
    assert.equal(assets.not_found_handling, "404-page");
    assert.equal(assets.run_worker_first, true);
    assert.deepEqual(wranglerConfig.routes, [
      { pattern: "gogocash.co", custom_domain: true },
      { pattern: "www.gogocash.co", custom_domain: true },
    ]);

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

  it("gates pull requests and deploys the production Worker through CI", () => {
    const ci = readRepoFile(".github/workflows/ci.yml");
    const production = readRepoFile(".github/workflows/deploy-production.yml");

    assert.match(ci, /pull_request:/);
    assert.match(ci, /npm run verify/);
    assert.match(
      production,
      /npm run lint && npm run test && npm run typecheck/,
    );
    assert.match(production, /name: Build static export\s+run: npm run build/);
    assert.match(production, /npm run test:e2e:ci/);
    assert.match(production, /wrangler deploy --config wrangler\.production\.jsonc/);
    for (const publicBuildVariable of [
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_ANALYTICS_ENABLED",
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_LINE_TAG_ID",
      "NEXT_PUBLIC_LINE_TAG_ENABLED",
      "NEXT_PUBLIC_POSTHOG_KEY",
      "NEXT_PUBLIC_POSTHOG_ENABLED",
      "NEXT_PUBLIC_MIXPANEL_TOKEN",
      "NEXT_PUBLIC_MIXPANEL_ENABLED",
    ]) {
      assert.match(production, new RegExp(`^\\s+${publicBuildVariable}:`, "m"));
    }
    assert.match(
      production,
      /NEXT_PUBLIC_LINE_TAG_ID:.*\|\| 'd27ab1a2-5e67-48d0-af8d-ca6b30b67452'/,
    );
    assert.match(
      production,
      /NEXT_PUBLIC_MIXPANEL_TOKEN:.*\|\| 'd97bbf4f9cd7512b562b6f0ddc723c4b'/,
    );
    const jobEnvironment = production.slice(
      production.indexOf("    env:"),
      production.indexOf("    steps:"),
    );
    assert.doesNotMatch(jobEnvironment, /secrets\./);
    for (const buildSecret of [
      "INVOLVE_ASIA_API_KEY",
      "INVOLVE_ASIA_API_SECRET",
      "STRAPI_API_TOKEN",
    ]) {
      assert.match(
        production,
        new RegExp(
          "name: Build static export[\\s\\S]*?" +
            buildSecret +
            ": \\$\\{\\{ secrets\\.",
        ),
      );
    }
    assert.match(
      production,
      /name: Deploy verified artifact[\s\S]*?CLOUDFLARE_API_TOKEN: \${{ secrets\./,
    );
  });
});
