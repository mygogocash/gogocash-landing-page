import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { learnArticleDateIso } from "./learn-article-dates";

describe("learnArticleDateIso", () => {
  it("preserves the calendar date without a timezone round-trip", () => {
    assert.equal(learnArticleDateIso("March 22, 2026"), "2026-03-22");
    assert.equal(learnArticleDateIso("15 July 2026"), "2026-07-15");
  });

  it("rejects impossible or unrecognized dates", () => {
    assert.equal(learnArticleDateIso("February 30, 2026"), undefined);
    assert.equal(learnArticleDateIso("Recently updated"), undefined);
  });
});
