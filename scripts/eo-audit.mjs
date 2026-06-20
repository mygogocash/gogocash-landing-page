import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outDir = path.join(root, "out");

const requiredBots = [
  "Googlebot",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "cohere-ai",
];

const requiredRoutes = [
  "/",
  "/en",
  "/id",
  "/th",
  "/tw",
  "/cn",
  "/ja",
  "/learn",
  "/cashback/shopee",
  "/cashback/lazada",
  "/cashback/agoda",
  "/cashback/trip-com",
  "/cashback/aliexpress",
  "/privacy-policy",
  "/terms-of-service",
  "/term-of-use",
  "/how-gogocash-makes-money",
  "/about",
  "/search",
];

const assetBudgets = [
  ["/images/hero-dashboard-phones.webp", 180_000],
  ["/images/how-it-works/browse-and-pick-your-brand.webp", 160_000],
  ["/images/how-it-works/shop-the-way-you-already-do.webp", 160_000],
  ["/images/how-it-works/cashback-after-the-merchant-confirms.webp", 160_000],
  ["/images/gogocash-logo-mark.png", 70_000],
  ["/images/gogocash-logo-mark-ui.png", 12_000],
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function statPublic(publicPath) {
  return fs.statSync(path.join(publicDir, publicPath.replace(/^\//, "")));
}

function htmlPath(route) {
  if (route === "/") return path.join(outDir, "index.html");
  return path.join(outDir, `${route.replace(/^\//, "")}.html`);
}

function assertFile(pathname) {
  assert.ok(fs.existsSync(pathname), `${pathname} is missing`);
}

function score(name, fn) {
  fn();
  return { name, score: 100 };
}

const scores = [];

scores.push(
  score("SEO", () => {
    const sitemap = read("out/sitemap.xml");
    const robots = read("out/robots.txt");
    const home = read("out/index.html");
    assert.match(home, /<title>Earn Cashback on Every Spend with GoGoCash<\/title>/);
    assert.match(home, /<meta name="description"/);
    assert.match(home, /rel="canonical"/);
    assert.match(home, /application\/ld\+json/);
    for (const route of requiredRoutes) {
      assert.match(sitemap, new RegExp(`<loc>https://gogocash\\.co${route === "/" ? "/" : route}</loc>`));
      assertFile(htmlPath(route));
    }
    assert.match(robots, /Sitemap:\s*https:\/\/gogocash\.co\/sitemap\.xml/);
  }),
);

scores.push(
  score("SEM", () => {
    for (const route of requiredRoutes.filter((route) => route.startsWith("/cashback/"))) {
      const html = read(path.relative(root, htmlPath(route)));
      assert.match(html, /Open GoGoCash for/);
      assert.match(html, /cta_clicked|partner_lp|https:\/\/app\.gogocash\.co|miniapp\.line\.me/);
      assert.match(html, /application\/ld\+json/);
    }
  }),
);

scores.push(
  score("AEO", () => {
    const home = read("out/index.html");
    assert.match(home, /"@type":"FAQPage"/);
    assert.match(home, /"@type":"FinancialService"/);
    assert.match(home, /"@type":"MobileApplication"/);
    assert.match(read("out/learn/how-cashback-works.html"), /"@type":"Article"/);
  }),
);

scores.push(
  score("GEO", () => {
    const robots = read("out/robots.txt");
    for (const bot of requiredBots) {
      assert.match(robots, new RegExp(`User-agent:\\s*${bot}`, "i"));
    }
    assert.doesNotMatch(robots, /Disallow:\s*\//i);
    assert.match(read("out/llms.txt"), /GoGoCash public discovery/);
    assert.match(read("out/skills.md"), /# GoGoCash Agent Skills/);
    assert.match(read("out/sitemap.md"), /Partner cashback landing pages/);
  }),
);

scores.push(
  score("LEO", () => {
    const sitemap = read("out/sitemap.xml");
    for (const route of ["/en", "/id", "/th", "/tw", "/cn", "/ja"]) {
      assert.match(sitemap, new RegExp(`<loc>https://gogocash\\.co${route}</loc>`));
      assertFile(htmlPath(route));
    }
  }),
);

scores.push(
  score("Performance", () => {
    for (const [publicPath, maxBytes] of assetBudgets) {
      assert.ok(statPublic(publicPath).size < maxBytes, `${publicPath} exceeds ${maxBytes} bytes`);
    }
    const partnerLogoCount = fs.readdirSync(path.join(publicDir, "images/partner-logos/optimized"))
      .filter((file) => file.endsWith(".webp")).length;
    assert.ok(partnerLogoCount >= 70, "optimized partner logo set is incomplete");
  }),
);

if (process.env.EO_AUDIT_URL) {
  const url = process.env.EO_AUDIT_URL;
  const result = spawnSync(
    "npm",
    [
      "exec",
      "--",
      "lighthouse",
      url,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      "--output-path=/tmp/gogocash-eo-lighthouse.json",
      "--chrome-flags=--headless --no-sandbox",
      "--quiet",
    ],
    { stdio: "inherit", cwd: root },
  );
  assert.equal(result.status, 0, "Lighthouse run failed");
  const report = JSON.parse(fs.readFileSync("/tmp/gogocash-eo-lighthouse.json", "utf8"));
  for (const [id, category] of Object.entries(report.categories)) {
    assert.equal(category.score, 1, `Lighthouse ${id} expected 100`);
  }
}

console.table(scores);
console.log("EO audit passed.");
