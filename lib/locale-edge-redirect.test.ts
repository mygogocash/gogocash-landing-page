import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatLocaleCookie } from "./locale-cookie";
import { resolveEdgeLocaleRedirect } from "./locale-edge-redirect";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

describe("locale-edge-redirect", () => {
  it("redirects Thailand visitors on / to /th when no English cookie", () => {
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "TH",
        cookieHeader: null,
        userAgent: BROWSER_UA,
        pathname: "/",
      }),
      "/th",
    );
  });

  it("does not redirect when cookie stores explicit English", () => {
    const cookieHeader = formatLocaleCookie({ lang: "en", region: "TH" });
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "TH",
        cookieHeader,
        userAgent: BROWSER_UA,
        pathname: "/",
      }),
      null,
    );
  });

  it("does not redirect bots even from Thailand", () => {
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "TH",
        cookieHeader: null,
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        pathname: "/",
      }),
      null,
    );
  });

  it("only intercepts exact root paths", () => {
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "TH",
        cookieHeader: null,
        userAgent: BROWSER_UA,
        pathname: "/about",
      }),
      null,
    );
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "TH",
        cookieHeader: null,
        userAgent: BROWSER_UA,
        pathname: "/th",
      }),
      null,
    );
  });

  it("does not redirect non-Thailand countries", () => {
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "SG",
        cookieHeader: null,
        userAgent: BROWSER_UA,
        pathname: "/",
      }),
      null,
    );
  });

  it("redirects /index.html for Thailand visitors", () => {
    assert.equal(
      resolveEdgeLocaleRedirect({
        country: "TH",
        cookieHeader: null,
        userAgent: BROWSER_UA,
        pathname: "/index.html",
      }),
      "/th",
    );
  });
});
