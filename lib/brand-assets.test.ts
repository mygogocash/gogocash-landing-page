import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { loadBundledPartnerBrands } from "./partner-logo-resolve";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function publicFile(assetPath: string): string {
  assert.ok(assetPath.startsWith("/"), `expected public path: ${assetPath}`);
  return path.join(process.cwd(), "public", assetPath);
}

function assertPngSignature(assetPath: string): void {
  const file = publicFile(assetPath);
  const signature = fs.readFileSync(file).subarray(0, PNG_SIGNATURE.length);
  assert.deepEqual(
    signature,
    PNG_SIGNATURE,
    `${assetPath} must contain PNG bytes so static hosts serve a renderable image`,
  );
}

describe("brand image assets", () => {
  it("serves the GoGoCash mark from a valid PNG file", () => {
    assertPngSignature("/images/gogocash-logo-mark.png");
  });

  it("serves bundled partner logos from existing PNG files", () => {
    const partners = loadBundledPartnerBrands();
    assert.ok(partners.length > 0);

    for (const partner of partners) {
      assertPngSignature(partner.logoUrl);
    }
  });
});
