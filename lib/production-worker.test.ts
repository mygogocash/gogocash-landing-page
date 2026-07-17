import assert from "node:assert/strict";
import { describe, it } from "node:test";
import worker from "../workers/production-geo-locale";

describe("production Worker", () => {
  it("canonicalizes trailing-dot hosts before fetching static assets", async () => {
    let assetFetches = 0;
    const response = await worker.fetch(
      new Request("https://gogocash.co./th?from=test"),
      {
        ASSETS: {
          async fetch() {
            assetFetches += 1;
            return new Response("asset");
          },
        },
      },
    );

    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get("location"),
      "https://gogocash.co/th?from=test",
    );
    assert.equal(assetFetches, 0);
    assert.match(
      response.headers.get("content-security-policy") ?? "",
      /default-src 'self'/,
    );
  });
});
