import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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
  it("pins the build image to the Node 26 runtime required by current tooling", () => {
    const packageJson = readJsonFile("package.json");
    const engines = packageJson.engines as Record<string, unknown>;

    assert.equal(readRepoFile(".nvmrc"), "26");
    assert.equal(readRepoFile(".node-version"), "26");
    assert.equal(engines.node, ">=26 <27");
    assert.match(readRepoFile("Dockerfile.dev"), /^FROM node:26-/m);
    for (const script of ["scripts/dev-local.sh", "scripts/start-dev.sh"]) {
      const source = readRepoFile(script);
      assert.match(source, /REQUIRED_NODE_MAJOR=26/);
      assert.match(source, /-ne "\$\{REQUIRED_NODE_MAJOR\}"/);
    }

    for (const contributorGuide of [
      "AGENTS.md",
      "README.md",
      ".cursor/skills/cloud-agent-run-test/SKILL.md",
    ]) {
      const source = readRepoFile(contributorGuide);
      assert.match(source, /Node(?:\.js)? 26\.x/);
      assert.match(source, />=26 <27/);
      assert.doesNotMatch(
        source,
        /Node(?:\.js)? 2[02](?:\.x)?|>=2[02] <2[13]/,
      );
    }

    const cloudAgentRunbook = readRepoFile(
      ".cursor/skills/cloud-agent-run-test/SKILL.md",
    );
    assert.doesNotMatch(
      cloudAgentRunbook,
      /dns:cloudflare-firebase-apex|\.env\.cloudflare\.example/,
    );
  });

  it("uses the explicit npm peer-resolution flag for controlled installs", () => {
    for (const filePath of [
      "Dockerfile.dev",
      ".github/workflows/ci.yml",
      ".github/workflows/deploy-production.yml",
      ".github/workflows/deploy-staging.yml",
      "AGENTS.md",
      "README.md",
      ".cursor/skills/cloud-agent-run-test/SKILL.md",
      "scripts/dev-local.sh",
      "scripts/start-dev.sh",
    ]) {
      const installCommands = readRepoFile(filePath)
        .split("\n")
        .filter((line) => /\bnpm(?:\s+--prefix\s+\S+)?\s+(?:ci|install)\b/.test(line));

      assert.ok(installCommands.length > 0, `${filePath} must install dependencies`);
      for (const command of installCommands) {
        assert.match(
          command,
          /\s--force\b/,
          `${filePath}: ${command.trim()}`,
        );
      }
    }

    const packageJson = readJsonFile("package.json");
    const scripts = packageJson.scripts as Record<string, string>;
    assert.match(scripts.setup, /npm install --force/);
    assert.match(scripts.local, /npm install --force/);
  });

  it("keeps TypeScript 7 as the gate while legacy API consumers use a shim", () => {
    const packageJson = readJsonFile("package.json");
    const scripts = packageJson.scripts as Record<string, string>;
    const devDependencies = packageJson.devDependencies as Record<string, string>;

    assert.equal(devDependencies.typescript, "^7.0.2");
    assert.equal(
      devDependencies["@typescript/native-preview"],
      "7.0.0-dev.20260707.2",
    );
    assert.equal(devDependencies["@typescript/typescript6"], "^6.0.2");
    assert.equal(
      scripts.typecheck,
      "npm exec -- next typegen && node ./node_modules/typescript/bin/tsc --noEmit",
    );
    assert.match(scripts.build, /^npm run typecheck && /);
    assert.match(scripts["build:webpack"], /^npm run typecheck && /);
    assert.match(
      scripts.lint,
      /--import \.\/scripts\/register-eslint-typescript-compat\.mjs/,
    );

    const compatibilityLoader = readRepoFile(
      "scripts/register-eslint-typescript-compat.mjs",
    );
    assert.match(compatibilityLoader, /registerHooks/);
    assert.match(
      compatibilityLoader,
      /require\.resolve\("@typescript\/typescript6"\)/,
    );

    const nativeVersion = execFileSync(
      process.execPath,
      ["-p", "require('typescript').version"],
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();
    const compatibilityVersion = execFileSync(
      process.execPath,
      [
        "--import",
        "./scripts/register-eslint-typescript-compat.mjs",
        "-p",
        "require('typescript').version",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();

    assert.match(nativeVersion, /^7\./);
    assert.match(compatibilityVersion, /^6\./);
  });

  it("self-hosts the production font instead of fetching Google during builds", () => {
    const packageJson = readJsonFile("package.json");
    const dependencies = packageJson.dependencies as Record<string, string>;
    const layout = readRepoFile("app/layout.tsx");

    assert.equal(dependencies["@fontsource/poppins"], "^5.2.7");
    assert.doesNotMatch(layout, /next\/font\/google/);
    assert.match(layout, /next\/font\/local/);
    assert.ok(
      fs.existsSync(
        path.join(process.cwd(), "public/licenses/poppins-OFL-1.1.txt"),
      ),
    );
    for (const weight of [400, 500, 600, 700]) {
      assert.match(
        layout,
        new RegExp(`poppins-latin-${weight}-normal\\.woff2`),
      );
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
    const packageJson = readJsonFile("package.json");
    const scripts = packageJson.scripts as Record<string, string>;
    const devDependencies = packageJson.devDependencies as Record<string, string>;
    const ci = readRepoFile(".github/workflows/ci.yml");
    const production = readRepoFile(".github/workflows/deploy-production.yml");

    assert.equal(devDependencies.wrangler, "^4.111.0");
    assert.match(
      scripts["deploy:cloudflare"],
      /^npm run build && npm exec -- wrangler deploy --config wrangler\.production\.jsonc$/,
    );
    assert.match(ci, /pull_request:/);
    assert.match(ci, /npm run verify/);
    assert.match(
      production,
      /npm run lint && npm run test && npm run typecheck/,
    );
    assert.match(production, /name: Build static export\s+run: npm run build/);
    assert.match(production, /npm run test:e2e:ci/);
    assert.match(production, /^\s+environment: landing-production$/m);
    assert.match(
      production,
      /actions\/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10\s+# v6/,
    );
    assert.match(
      production,
      /actions\/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38\s+# v6/,
    );
    assert.match(
      production,
      /npm exec -- wrangler deploy --config wrangler\.production\.jsonc/,
    );
    assert.doesNotMatch(production, /\bnpx(?:\s+--yes)?\s+wrangler\b/);
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
    assert.doesNotMatch(
      production,
      /secrets\.CLOUDFLARE_API_TOKEN/,
    );

    const validateToken = production.indexOf(
      "name: Validate Cloudflare API token format",
    );
    const verifyToken = production.indexOf(
      "name: Verify Cloudflare API token",
    );
    const deploy = production.indexOf("name: Deploy verified artifact");
    assert.ok(validateToken > 0, "production deploy must validate token format");
    assert.ok(
      verifyToken > validateToken,
      "Cloudflare auth preflight must run after local token validation",
    );
    assert.ok(
      deploy > verifyToken,
      "Cloudflare auth preflight must run before deployment",
    );
    assert.match(
      production,
      /https:\/\/api\.cloudflare\.com\/client\/v4\/user\/tokens\/verify/,
    );
    assert.match(
      production,
      /result\?\.status !== "active"/,
    );
    assert.match(
      production,
      /CLOUDFLARE_API_TOKEN: \${{ secrets\.CLOUDFLARE_LANDING_API_TOKEN }}/,
    );
    for (const structuralCheck of [
      "hasOuterWhitespace",
      "hasWhitespace",
      "hasBearerPrefix",
      "hasQuotes",
      "looksJson",
      "looksMasked",
      "hasImplausibleLength",
    ]) {
      assert.match(production, new RegExp(`const ${structuralCheck} =`));
      assert.match(production, new RegExp(`\\|\\|\\s+${structuralCheck}`));
    }
    assert.match(production, /token !== token\.trim\(\)/);
    assert.match(production, /token\.length < 40 \|\| token\.length > 80/);
    assert.doesNotMatch(production, /isLegacy|isScannable/);
    assert.doesNotMatch(production, /const token = [^;]*\.trim\(/);
    assert.doesNotMatch(production, /replace\(/);
  });

  it("retires the repo-hosted Learn CMS without removing external Strapi support", () => {
    assert.equal(
      fs.existsSync(
        path.join(process.cwd(), ".github/workflows/deploy-cms-cloudflare.yml"),
      ),
      false,
    );

    const packageJson = readJsonFile("package.json");
    const scripts = packageJson.scripts as Record<string, string>;
    const readme = readRepoFile("README.md");
    const learnDocs = readRepoFile("docs/learn-content.md");

    assert.match(scripts["learn:strapi-push"], /push-learn-to-strapi/);
    assert.match(readme, /Workers Routes[^.\n]*(?:write|edit)/i);
    assert.match(readme, /Zone Resources[^.\n]*gogocash\.co/i);
    for (const documentation of [readme, learnDocs]) {
      assert.match(documentation, /externally managed Strapi/i);
      assert.match(documentation, /local Markdown/i);
      assert.match(documentation, /learn:strapi-push/);
      assert.doesNotMatch(documentation, /deploy-cms-cloudflare|CMS_/);
    }
  });
});
