import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

describe("client environment contract", () => {
  it("uses statically analyzable NEXT_PUBLIC member access", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "lib/app-config.ts"), "utf8");
    const required = [
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_ANALYTICS_ENABLED",
      "NEXT_PUBLIC_LINE_TAG_ID",
      "NEXT_PUBLIC_MIXPANEL_TOKEN",
      "NEXT_PUBLIC_MIXPANEL_API_HOST",
      "NEXT_PUBLIC_MIXPANEL_ENABLED",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    ];

    for (const name of required) {
      assert.match(source, new RegExp(`process\\.env\\.${name}\\b`), name);
    }
    assert.doesNotMatch(source, /readTrimmedEnv\("NEXT_PUBLIC_/);
    assert.doesNotMatch(source, /readPublicIntegrationIdEnv\(\s*"NEXT_PUBLIC_/);
  });
});
