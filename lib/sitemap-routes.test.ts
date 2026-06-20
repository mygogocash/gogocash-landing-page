import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildSitemapEntries } from "./sitemap-routes";

function isoDate(value: Date | string | undefined): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

describe("buildSitemapEntries", () => {
  it("uses current per-route dates instead of one stale global date", async () => {
    const entries = await buildSitemapEntries("https://gogocash.co");
    const byPath = new Map(
      entries.map((entry) => [new URL(entry.url).pathname, entry]),
    );

    assert.equal(
      isoDate(byPath.get("/learn/how-quests-work")?.lastModified),
      "2026-06-03T00:00:00.000Z",
    );
    assert.equal(
      isoDate(byPath.get("/learn/how-cashback-works")?.lastModified),
      "2026-03-22T00:00:00.000Z",
    );
    assert.equal(
      isoDate(byPath.get("/")?.lastModified),
      "2026-06-20T00:00:00.000Z",
    );
  });
});
