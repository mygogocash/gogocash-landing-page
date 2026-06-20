import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  HERO_DASHBOARD_PHONES_IMAGE,
  HOW_IT_WORKS_IMAGE_PATHS,
  LOGO_MARK_IMAGE,
  LOGO_MARK_UI_IMAGE,
} from "./seo-assets";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function publicAssetSize(assetPath: string): number {
  return fs.statSync(path.join(PUBLIC_DIR, assetPath.replace(/^\//, ""))).size;
}

describe("SEO image assets", () => {
  it("uses optimized raster assets for LCP and how-it-works illustrations", () => {
    assert.match(HERO_DASHBOARD_PHONES_IMAGE.src, /\.webp$/);
    assert.ok(publicAssetSize(HERO_DASHBOARD_PHONES_IMAGE.src) < 180_000);

    for (const src of HOW_IT_WORKS_IMAGE_PATHS) {
      assert.match(src, /\.webp$/);
      assert.ok(publicAssetSize(src) < 160_000, src);
    }
  });

  it("keeps the rendered logo mark small enough for repeated header/footer use", () => {
    assert.match(LOGO_MARK_IMAGE.src, /\.png$/);
    assert.ok(publicAssetSize(LOGO_MARK_IMAGE.src) < 70_000);
    assert.match(LOGO_MARK_UI_IMAGE.src, /\.png$/);
    assert.ok(publicAssetSize(LOGO_MARK_UI_IMAGE.src) < 12_000);
  });
});
