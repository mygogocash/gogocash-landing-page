import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_LOCALE,
  getSectionedLandingBasePath,
  isSectionedLandingPath,
  isThailandTimezone,
  matchBrowserLocaleTagForRedirect,
  resolveAutoRedirectFromBrowserLocales,
  resolveLanguageSelection,
  resolveLocaleForPathname,
  resolveThailandClientRedirect,
} from "./locale-routing";

describe("locale-routing", () => {
  it("recognizes sectioned landing paths", () => {
    assert.equal(isSectionedLandingPath("/"), true);
    assert.equal(isSectionedLandingPath("/th"), true);
    assert.equal(isSectionedLandingPath("/ja/offers"), true);
    assert.equal(isSectionedLandingPath("/cn"), true);
    assert.equal(isSectionedLandingPath("/cn/about"), true);
    assert.equal(isSectionedLandingPath("/id"), true);
    assert.equal(isSectionedLandingPath("/id/offers"), true);
    assert.equal(isSectionedLandingPath("/learn"), false);
  });

  it("returns the base path for sectioned landing routes", () => {
    assert.equal(getSectionedLandingBasePath("/"), "/");
    assert.equal(getSectionedLandingBasePath("/tw"), "/tw");
    assert.equal(getSectionedLandingBasePath("/ja/anything"), "/ja");
    assert.equal(getSectionedLandingBasePath("/cn/offers"), "/cn");
    assert.equal(getSectionedLandingBasePath("/id/offers"), "/id");
    assert.equal(getSectionedLandingBasePath("/learn"), "/");
  });

  it("resolves locale from known pathnames", () => {
    assert.deepEqual(resolveLocaleForPathname("/"), DEFAULT_LOCALE);
    assert.deepEqual(resolveLocaleForPathname("/th"), {
      lang: "th",
      region: "TH",
    });
    assert.deepEqual(resolveLocaleForPathname("/id"), {
      lang: "id",
      region: "ID",
    });
    assert.deepEqual(resolveLocaleForPathname("/cn"), {
      lang: "zh-CN",
      region: "CN",
    });
    assert.equal(resolveLocaleForPathname("/learn"), null);
  });

  it("maps language selection to route and locale", () => {
    assert.deepEqual(resolveLanguageSelection("en", "SG"), {
      path: "/",
      locale: { lang: "en", region: "SG" },
    });
    assert.deepEqual(resolveLanguageSelection("zh-TW", "TH"), {
      path: "/tw",
      locale: { lang: "zh-TW", region: "TW" },
    });
    assert.deepEqual(resolveLanguageSelection("zh-CN", "SG"), {
      path: "/cn",
      locale: { lang: "zh-CN", region: "CN" },
    });
    assert.deepEqual(resolveLanguageSelection("id", "TH"), {
      path: "/id",
      locale: { lang: "id", region: "ID" },
    });
  });

  it("maps a single BCP-47 tag to auto-redirect paths", () => {
    assert.equal(matchBrowserLocaleTagForRedirect("th-TH"), "/th");
    assert.equal(matchBrowserLocaleTagForRedirect("id-ID"), "/id");
    assert.equal(matchBrowserLocaleTagForRedirect("ja-JP"), "/ja");
    assert.equal(matchBrowserLocaleTagForRedirect("en-SG"), "/");
    assert.equal(matchBrowserLocaleTagForRedirect("EN_us"), "/");

    assert.equal(matchBrowserLocaleTagForRedirect("zh-TW"), "/tw");
    assert.equal(matchBrowserLocaleTagForRedirect("zh-HK"), "/tw");
    assert.equal(matchBrowserLocaleTagForRedirect("zh-MO"), "/tw");
    assert.equal(matchBrowserLocaleTagForRedirect("zh-Hant"), "/tw");
    assert.equal(matchBrowserLocaleTagForRedirect("zh-CN"), "/cn");
    assert.equal(matchBrowserLocaleTagForRedirect("zh-SG"), "/cn");
    assert.equal(matchBrowserLocaleTagForRedirect("zh-Hans"), "/cn");

    assert.equal(matchBrowserLocaleTagForRedirect("zh"), null);
    assert.equal(matchBrowserLocaleTagForRedirect("zh-yue"), null);
    assert.equal(matchBrowserLocaleTagForRedirect("fr-FR"), null);
  });

  it("walks ordered browser locales and picks the first match", () => {
    assert.equal(resolveAutoRedirectFromBrowserLocales(["fr-FR", "th-TH"]), "/th");
    assert.equal(resolveAutoRedirectFromBrowserLocales(["zh", "en-GB"]), "/");
    assert.equal(resolveAutoRedirectFromBrowserLocales(["zh", "ja"]), "/ja");
    assert.equal(resolveAutoRedirectFromBrowserLocales(["zh-CN", "zh-TW"]), "/cn");
    assert.equal(resolveAutoRedirectFromBrowserLocales([]), null);
  });

  it("isThailandTimezone matches Asia/Bangkok only", () => {
    assert.equal(isThailandTimezone("Asia/Bangkok"), true);
    assert.equal(isThailandTimezone("America/New_York"), false);
  });

  it("resolveThailandClientRedirect prefers browser tags then Bangkok timezone", () => {
    assert.equal(
      resolveThailandClientRedirect("Asia/Bangkok", ["en-US"]),
      "/th",
    );
    assert.equal(
      resolveThailandClientRedirect("America/New_York", ["en-US"]),
      "/",
    );
    assert.equal(
      resolveThailandClientRedirect("Asia/Bangkok", ["th-TH"]),
      "/th",
    );
    assert.equal(
      resolveThailandClientRedirect("Asia/Bangkok", ["ja-JP"]),
      "/ja",
    );
    assert.equal(
      resolveThailandClientRedirect("Asia/Bangkok", ["fr-FR"]),
      "/th",
    );
    assert.equal(
      resolveThailandClientRedirect("Europe/Paris", ["fr-FR"]),
      null,
    );
  });
});
