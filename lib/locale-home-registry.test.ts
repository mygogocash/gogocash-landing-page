import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LOCALE_HOME_COPY,
  LOCALE_HOME_IDS,
  localeHomeCopy,
} from "./locale-home-registry";
import { TH_HOME } from "./copy-th-home";

describe("locale-home-registry", () => {
  it("exposes every locale id in the copy map", () => {
    for (const id of LOCALE_HOME_IDS) {
      assert.ok(LOCALE_HOME_COPY[id]);
    }
    assert.equal(Object.keys(LOCALE_HOME_COPY).length, LOCALE_HOME_IDS.length);
  });

  it("localeHomeCopy returns the same objects as legacy module exports", () => {
    assert.equal(localeHomeCopy("th"), TH_HOME);
  });

  it("promotes Indonesian into the full localized-home registry", () => {
    assert.ok(LOCALE_HOME_IDS.includes("id"));
    assert.equal(LOCALE_HOME_COPY.id.langNavLocal, "Bahasa Indonesia");
  });

  it("keeps route-level language and partner-alt metadata beside each locale", () => {
    for (const id of LOCALE_HOME_IDS) {
      const entry = LOCALE_HOME_COPY[id];
      assert.ok(entry.documentLang.length > 0, id);
      assert.ok(entry.partnerLogoAltTemplate.includes("{name}"), id);
    }
  });

  it("requires complete localized Quests copy for every locale", () => {
    for (const id of LOCALE_HOME_IDS) {
      const quests = LOCALE_HOME_COPY[id].quests;
      assert.ok(quests.badge.length > 0, `${id}: badge`);
      assert.ok(quests.title.length > 0, `${id}: title`);
      assert.ok(quests.intro.length > 0, `${id}: intro`);
      assert.equal(quests.cards.length, 3, `${id}: cards`);
      assert.equal(
        new Set(quests.cards.map((card) => card.title)).size,
        3,
        `${id}: unique card titles`,
      );
      assert.ok(quests.stacking.length > 0, `${id}: stacking`);
      assert.ok(quests.cta.length > 0, `${id}: cta`);
    }
  });
});
