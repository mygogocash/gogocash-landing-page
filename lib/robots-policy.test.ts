import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const AI_DISCOVERY_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
] as const;

describe("robots AI discovery policy", () => {
  const robots = fs.readFileSync(
    path.join(process.cwd(), "public/robots.txt"),
    "utf8",
  );

  it("allows the AI/search crawlers used by the GEO/AEO policy", () => {
    for (const bot of AI_DISCOVERY_BOTS) {
      assert.match(robots, new RegExp(`User-agent:\\s*${bot}`, "i"));
    }
  });

  it("does not include disallow rules that conflict with all-bot visibility", () => {
    assert.doesNotMatch(robots, /Disallow:\s*\//i);
  });
});
