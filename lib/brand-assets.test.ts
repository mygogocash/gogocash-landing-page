import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import sharp from "sharp";

import { loadBundledPartnerBrands } from "./partner-logo-resolve";

const HERO_SOURCE = path.join(
  process.cwd(),
  "design-sources/marketing-art/hero-dashboard-phones.svg",
);
const HERO_COMPONENT = path.join(
  process.cwd(),
  "components/landing/landing-hero-shell.tsx",
);
const HERO_GENERATOR = path.join(
  process.cwd(),
  "scripts/generate-hero-assets.mjs",
);
const HERO_WIDTHS = [480, 800, 1200, 1600] as const;
const HERO_FORMATS = ["avif", "webp"] as const;

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
  it("ships a neutral, reproducible responsive hero illustration", async () => {
    const source = fs.readFileSync(HERO_SOURCE, "utf8");
    const component = fs.readFileSync(HERO_COMPONENT, "utf8");

    assert.ok(fs.existsSync(HERO_GENERATOR), "hero asset generator is missing");
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    assert.equal(
      packageJson.scripts?.["generate:hero-assets"],
      "node scripts/generate-hero-assets.mjs",
    );
    assert.match(
      packageJson.scripts?.["generate:assets"] ?? "",
      /generate:hero-assets/,
    );
    assert.match(source, /viewBox="0 0 1600 1200"/);
    assert.match(source, /id="wallet-panel"/);
    assert.match(source, /id="quest-panel"/);
    assert.doesNotMatch(
      source,
      /<text\b|<image\b|data:image|xlink:href/i,
      "hero source must use vector icons without embedded screenshots or rendered text",
    );

    for (const width of HERO_WIDTHS) {
      for (const format of HERO_FORMATS) {
        const assetPath = `/images/hero-neutral-phones-${width}.${format}`;
        const file = publicFile(assetPath);
        assert.ok(
          component.includes(assetPath),
          `${assetPath} is not referenced by the hero picture`,
        );
        assert.ok(fs.existsSync(file), `${assetPath} is missing`);
        assert.ok(
          fs.statSync(file).size <= 300 * 1024,
          `${assetPath} exceeds 300 KB`,
        );
        const metadata = await sharp(file).metadata();
        assert.equal(metadata.width, width, `${assetPath} width drifted`);
        assert.equal(
          metadata.height,
          width * 0.75,
          `${assetPath} must retain the 4:3 source ratio`,
        );
        assert.equal(
          metadata.hasAlpha,
          true,
          `${assetPath} must retain transparency`,
        );
      }
    }

    const check = spawnSync(process.execPath, [HERO_GENERATOR, "--check"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    assert.equal(
      check.status,
      0,
      `committed hero assets are stale:\n${check.stderr || check.stdout}`,
    );

    assert.match(
      component,
      /alt=""/,
      "the adjacent hero copy already describes this decorative illustration",
    );

    for (const width of HERO_WIDTHS) {
      for (const format of HERO_FORMATS) {
        assert.equal(
          fs.existsSync(publicFile(`/images/hero-dashboard-phones-${width}.${format}`)),
          false,
          `legacy locale-specific hero asset must be removed: ${width}.${format}`,
        );
      }
    }
  });

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
