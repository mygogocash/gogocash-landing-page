import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { FAQ_ITEMS } from "./faq-data";
import { CN_HOME } from "./copy-cn-home";
import { ID_HOME } from "./copy-id-home";
import { JA_HOME } from "./copy-ja-home";
import { TH_HOME } from "./copy-th-home";
import { TW_HOME } from "./copy-tw-home";
import {
  faqItemsForLocale,
  type FaqLocaleId,
} from "./locale-faq";
import { loadBundledPartnerBrands } from "./partner-logo-resolve";
import { SITE_FACTS, heroSeoSupportingLine } from "./site-facts";

const BARE_BRAND_CLAIM = new RegExp(
  `${SITE_FACTS.partnerCountLabel.replace("+", "\\+")}\\s+brands\\b`,
  "i",
);

const FAQ_LOCALE_SOURCES = [
  { id: "en", source: "./faq-data.ts" },
  { id: "th", source: "./faq-data-th.ts" },
  { id: "ja", source: "./faq-data-ja.ts" },
  { id: "cn", source: "./faq-data-cn.ts" },
  { id: "tw", source: "./faq-data-tw.ts" },
  { id: "id", source: "./faq-data-id.ts" },
] as const satisfies ReadonlyArray<{ id: FaqLocaleId; source: string }>;

function exactNumericClaim(value: number): RegExp {
  return new RegExp(`(?<!\\d)${value}\\+?(?!\\d)`);
}

/**
 * Issue #5 — copy said "70+ brands" while the brand directory shows the live
 * count (123). "70+" is the *active cashback partner* claim; the directory is
 * the *browsable brand* list. Keep them as distinct, non-contradicting metrics:
 * the claim is framed as "partners", and the directory must be a superset of it.
 */
describe("site-facts brand claim consistency", () => {
  it("exposes the cashback percentage as data as well as presentation copy", () => {
    assert.equal(SITE_FACTS.maxCashbackPercent, 30);
    assert.equal(SITE_FACTS.maxCashbackLabel, "30%");
    assert.equal(
      SITE_FACTS.maxCashbackPhrase,
      `up to ${SITE_FACTS.maxCashbackLabel}`,
    );
  });
  it("frames the 70+ figure as partners, not a bare brand count", () => {
    const line = heroSeoSupportingLine();
    assert.ok(
      line.includes(SITE_FACTS.partnerCountLabel),
      `expected the partner-count label in: ${line}`,
    );
    assert.ok(
      /partner/i.test(line),
      `claim should use partner framing: ${line}`,
    );
    assert.ok(
      !new RegExp(`${SITE_FACTS.partnerCountLabel.replace("+", "\\+")}\\s+brands\\b`, "i").test(line),
      `claim must not read as a bare brand count that collides with the directory: ${line}`,
    );
  });

  it("browsable brand directory is a superset of the active-partner claim", () => {
    const directoryCount = loadBundledPartnerBrands().length;
    assert.ok(
      directoryCount >= SITE_FACTS.partnerCountMin,
      `directory has ${directoryCount} brands but claims ${SITE_FACTS.partnerCountMin}+ partners`,
    );
  });

  it("FAQ copy never states the partner count as a bare brand count", () => {
    for (const item of FAQ_ITEMS) {
      const text = `${item.question} ${item.answer}`;
      assert.ok(
        !BARE_BRAND_CLAIM.test(text),
        `FAQ collides with the brand directory ("${SITE_FACTS.partnerCountLabel} brands"): ${item.question}`,
      );
    }
  });

  it("derives FAQ marketing numbers from SITE_FACTS in every locale", () => {
    for (const { id, source } of FAQ_LOCALE_SOURCES) {
      const sourceText = readFileSync(new URL(source, import.meta.url), "utf8");
      const renderedText = faqItemsForLocale(id)
        .map(({ question, answer }) => `${question} ${answer}`)
        .join(" ");

      assert.ok(
        renderedText.includes(String(SITE_FACTS.partnerCountMin)),
        `${id} FAQ should render the canonical partner count`,
      );
      assert.match(
        sourceText,
        /SITE_FACTS\.partnerCount(?:Min|Label)/,
        `${source} should interpolate the partner count from SITE_FACTS`,
      );
      assert.ok(
        !exactNumericClaim(SITE_FACTS.partnerCountMin).test(sourceText),
        `${source} must not hardcode the partner-count claim`,
      );
      assert.ok(
        !exactNumericClaim(SITE_FACTS.maxCashbackPercent).test(sourceText),
        `${source} must not hardcode the maximum-cashback claim`,
      );
    }
  });
});

describe("unsupported community-size claim removal", () => {
  it("does not expose or interpolate an unverified shopper count", () => {
    assert.equal("shopperCommunityLabel" in SITE_FACTS, false);

    const marketingSources = [
      "../components/home-page.tsx",
      "./copy-th-home.ts",
      "./copy-id-home.ts",
      "./copy-ja-home.ts",
      "./copy-tw-home.ts",
      "./copy-cn-home.ts",
    ];

    for (const source of marketingSources) {
      const sourceText = readFileSync(new URL(source, import.meta.url), "utf8");
      assert.doesNotMatch(sourceText, /6M\+|shopperCommunityLabel/);
    }
  });

  it("uses the approved non-numeric benefit copy in every locale", () => {
    assert.equal(
      TH_HOME.features.ctaCard.bodyLine,
      "รับเงินคืนจากการช้อปได้ง่าย ๆ กับ GoGoCash",
    );
    assert.equal(
      TH_HOME.finalCta.sub,
      "เปลี่ยนทุกการใช้จ่ายในชีวิตประจำวันให้เป็นแคชแบ็กที่ถอนได้",
    );
    assert.equal(
      ID_HOME.features.ctaCard.bodyLine,
      "Dapatkan cashback dengan mudah bersama GoGoCash.",
    );
    assert.equal(
      ID_HOME.finalCta.sub,
      "Ubah belanja sehari-hari menjadi cashback yang bisa ditarik.",
    );
    assert.equal(
      JA_HOME.features.ctaCard.bodyLine,
      "GoGoCashなら、かんたんにキャッシュバックを貯められます。",
    );
    assert.equal(
      JA_HOME.finalCta.sub,
      "毎日のお買い物を、引き出せるキャッシュバックに変えましょう。",
    );
    assert.equal(
      TW_HOME.features.ctaCard.bodyLine,
      "使用 GoGoCash，輕鬆累積現金回饋。",
    );
    assert.equal(
      TW_HOME.finalCta.sub,
      "將日常消費變成可提領的現金回饋。",
    );
    assert.equal(
      CN_HOME.features.ctaCard.bodyLine,
      "使用 GoGoCash，轻松累积现金回馈。",
    );
    assert.equal(
      CN_HOME.finalCta.sub,
      "将日常消费变成可提现的现金回馈。",
    );

    const englishHomeSource = readFileSync(
      new URL("../components/home-page.tsx", import.meta.url),
      "utf8",
    );
    assert.match(
      englishHomeSource,
      /subtitle="Turn everyday spending into withdrawable cashback with GoGoCash\."/,
    );
  });
});
