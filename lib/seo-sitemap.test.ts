import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap";

function isoDate(value: Date | string | undefined): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date
    ? value.toISOString().slice(0, 10)
    : value.slice(0, 10);
}

describe("SEO sitemap", () => {
  it("submits canonical URLs only", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    assert.equal(urls.has("https://gogocash.co/en"), false);
    assert.equal(urls.has("https://gogocash.co/terms-of-service"), false);
    assert.equal(urls.has("https://gogocash.co/"), true);
    assert.equal(urls.has("https://gogocash.co/term-of-use"), true);
  });

  it("emits lastmod only when the page has an authoritative date", async () => {
    const entries = await sitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    assert.equal(byUrl.get("https://gogocash.co/")?.lastModified, undefined);
    assert.equal(
      isoDate(byUrl.get("https://gogocash.co/privacy-policy")?.lastModified),
      "2026-07-15",
    );
    assert.equal(
      isoDate(
        byUrl.get("https://gogocash.co/learn/how-cashback-works")
          ?.lastModified,
      ),
      "2026-03-22",
    );
  });
});
