import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
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
  assert.ok(
    fs.existsSync(file),
    `${assetPath}: file not found at ${file}`,
  );
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
    assert.ok(
      partners.length > 0,
      "loadBundledPartnerBrands() returned no partners — check partner-logo-resolve.ts",
    );

    for (const partner of partners) {
      assertPngSignature(partner.logoUrl);
    }
  });

  it("does not deploy byte-identical partner logo files", () => {
    const dir = path.join(process.cwd(), "public/images/partner-logos");
    const byHash = new Map<string, string>();

    for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".png"))) {
      const bytes = fs.readFileSync(path.join(dir, name));
      const hash = createHash("sha256").update(bytes).digest("hex");
      const previous = byHash.get(hash);
      assert.equal(
        previous,
        undefined,
        `${name} duplicates ${previous}; keep one canonical public URL`,
      );
      byHash.set(hash, name);
    }
  });

  it("keeps every deployed image within the 300 KB asset budget", () => {
    const imageRoot = path.join(process.cwd(), "public/images");
    const visit = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) visit(file);
        else {
          assert.ok(
            fs.statSync(file).size <= 300 * 1024,
            `${path.relative(process.cwd(), file)} exceeds 300 KB`,
          );
        }
      }
    };

    visit(imageRoot);
  });
});
