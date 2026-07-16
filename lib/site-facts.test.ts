import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { FAQ_ITEMS } from "./faq-data";
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
