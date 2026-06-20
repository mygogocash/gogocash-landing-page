import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

function readPublicAsset(assetPath: string): Buffer {
  return readFileSync(path.join(process.cwd(), "public", assetPath));
}

function isPng(buffer: Buffer): boolean {
  return buffer.subarray(0, 8).equals(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
}

describe("public image assets", () => {
  it("serves PNG-named logo and trust assets with PNG bytes", () => {
    for (const assetPath of [
      "images/gogocash-logo-mark.png",
      "branding/cloudflare-logo.png",
    ]) {
      assert.equal(isPng(readPublicAsset(assetPath)), true, assetPath);
    }
  });
});
