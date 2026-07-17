import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withProductionHeaders } from "./production-response-headers";

describe("withProductionHeaders", () => {
  it("adds the production security policy to HTML responses", () => {
    const response = withProductionHeaders(
      new Response("<html></html>", {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      }),
      "/th",
    );

    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(
      response.headers.get("referrer-policy"),
      "strict-origin-when-cross-origin",
    );
    const csp = response.headers.get("content-security-policy") ?? "";
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(csp, /form-action 'self'/);
    assert.match(csp, /script-src[^;]*https:\/\/\*\.i\.posthog\.com/);
    assert.match(csp, /img-src[^;]*https:\/\/tr\.line\.me/);
    assert.match(csp, /connect-src[^;]*https:\/\/analytics\.google\.com/);
    assert.doesNotMatch(csp, /doubleclick|adservice/);
    assert.match(csp, /frame-src 'self' https:/);
    assert.match(response.headers.get("strict-transport-security") ?? "", /max-age=31536000/);
    assert.equal(
      response.headers.get("cache-control"),
      "public, max-age=0, must-revalidate, no-transform",
    );
  });

  it("makes hashed Next assets immutable", () => {
    const response = withProductionHeaders(new Response("asset"), "/_next/static/chunks/app-abc.js");
    assert.equal(
      response.headers.get("cache-control"),
      "public, max-age=31536000, immutable",
    );
  });

  it("sets no-transform when HTML has no cache policy", () => {
    const response = withProductionHeaders(
      new Response("<html></html>", {
        headers: { "Content-Type": "text/html" },
      }),
      "/404",
    );

    assert.equal(response.headers.get("cache-control"), "no-transform");
  });

  it("does not duplicate an existing mixed-case no-transform directive", () => {
    const response = withProductionHeaders(
      new Response("<html></html>", {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-store, NO-TRANSFORM",
        },
      }),
      "/404",
    );

    assert.equal(
      response.headers.get("cache-control"),
      "no-store, NO-TRANSFORM",
    );
  });

  it("preserves error cache policy while protecting an HTML asset miss", () => {
    const response = withProductionHeaders(
      new Response("<html>missing</html>", {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }),
      "/_next/static/chunks/missing.js",
    );

    assert.equal(response.status, 404);
    assert.equal(
      response.headers.get("cache-control"),
      "no-store, no-transform",
    );
  });

  it("does not cache missing hashed assets as immutable", () => {
    const response = withProductionHeaders(
      new Response("missing", { status: 404 }),
      "/_next/static/chunks/missing.js",
    );
    assert.equal(response.headers.get("cache-control"), null);
  });
});
