import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { documentLanguageForPathname } from "./document-language";

describe("documentLanguageForPathname", () => {
  it("maps localized landing paths to valid document language tags", () => {
    assert.equal(documentLanguageForPathname("/th"), "th");
    assert.equal(documentLanguageForPathname("/ja"), "ja");
    assert.equal(documentLanguageForPathname("/cn"), "zh-Hans");
    assert.equal(documentLanguageForPathname("/tw"), "zh-Hant");
    assert.equal(documentLanguageForPathname("/id"), "id");
  });

  it("uses English for root and non-localized content", () => {
    assert.equal(documentLanguageForPathname("/"), "en");
    assert.equal(documentLanguageForPathname("/learn/how-cashback-works"), "en");
  });
});
