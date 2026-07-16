import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LOCALE_COOKIE_NAME,
  formatLocaleCookie,
  localeCookieAttributes,
  parseLocaleCookie,
  shouldSkipThailandDefaultRedirect,
} from "./locale-cookie";

describe("locale-cookie", () => {
  it("formatLocaleCookie encodes JSON under gogocash.locale", () => {
    const formatted = formatLocaleCookie({ lang: "en", region: "TH" });
    assert.equal(formatted.startsWith(`${LOCALE_COOKIE_NAME}=`), true);
    const value = formatted.slice(`${LOCALE_COOKIE_NAME}=`.length);
    assert.deepEqual(JSON.parse(decodeURIComponent(value)), {
      lang: "en",
      region: "TH",
    });
  });

  it("parseLocaleCookie reads a formatted locale cookie", () => {
    const cookie = formatLocaleCookie({ lang: "th", region: "TH" });
    assert.deepEqual(parseLocaleCookie(cookie), { lang: "th", region: "TH" });
  });

  it("parseLocaleCookie finds gogocash.locale among other cookies", () => {
    const localeCookie = formatLocaleCookie({ lang: "en", region: "SG" });
    const header = `other=1; ${localeCookie}; session=abc`;
    assert.deepEqual(parseLocaleCookie(header), { lang: "en", region: "SG" });
  });

  it("parseLocaleCookie returns null for missing or invalid cookies", () => {
    assert.equal(parseLocaleCookie(null), null);
    assert.equal(parseLocaleCookie(""), null);
    assert.equal(parseLocaleCookie("other=1"), null);
    assert.equal(parseLocaleCookie(`${LOCALE_COOKIE_NAME}=not-json`), null);
    assert.equal(parseLocaleCookie(`${LOCALE_COOKIE_NAME}=%7B%7D`), null);
  });

  it("parseLocaleCookie skips malformed duplicates and accepts a later valid value", () => {
    const valid = formatLocaleCookie({ lang: "ja", region: "JP" });
    const header = `${LOCALE_COOKIE_NAME}=not-json; ${valid}`;
    assert.deepEqual(parseLocaleCookie(header), { lang: "ja", region: "JP" });
  });

  it("shouldSkipThailandDefaultRedirect respects every explicit locale", () => {
    assert.equal(shouldSkipThailandDefaultRedirect(null), false);
    assert.equal(shouldSkipThailandDefaultRedirect({ lang: "th", region: "TH" }), true);
    assert.equal(shouldSkipThailandDefaultRedirect({ lang: "ja", region: "JP" }), true);
    assert.equal(shouldSkipThailandDefaultRedirect({ lang: "en", region: "TH" }), true);
    assert.equal(shouldSkipThailandDefaultRedirect({ lang: "en", region: "SG" }), true);
  });

  it("marks the locale cookie Secure on HTTPS", () => {
    assert.match(localeCookieAttributes(true), /(?:^|; )Secure(?:;|$)/);
    assert.doesNotMatch(localeCookieAttributes(false), /(?:^|; )Secure(?:;|$)/);
  });
});
