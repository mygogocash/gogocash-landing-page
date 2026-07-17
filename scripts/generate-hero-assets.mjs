#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const generatorPath = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(generatorPath), "..");
const sourcePath = join(
  repoRoot,
  "design-sources",
  "marketing-art",
  "hero-dashboard-phones.svg",
);
const manifestPath = join(
  repoRoot,
  "design-sources",
  "marketing-art",
  "hero-assets.provenance.json",
);
const imagesDir = join(repoRoot, "public", "images");
const generationConfig = {
  density: 144,
  aspectRatio: { width: 4, height: 3 },
  widths: [480, 800, 1200, 1600],
  formats: {
    avif: { quality: 72, effort: 6, chromaSubsampling: "4:4:4" },
    webp: { quality: 84, alphaQuality: 100, effort: 6 },
  },
  maxBytes: 300 * 1024,
};
const widths = generationConfig.widths;
const formats = Object.keys(generationConfig.formats);
const checkOnly = process.argv.includes("--check");
const source = readFileSync(sourcePath);
const sourceMarkup = source.toString("utf8");

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function repoPath(file) {
  return relative(repoRoot, file).replaceAll("\\", "/");
}

function expectedHeight(width) {
  return Math.round(
    (width * generationConfig.aspectRatio.height) /
      generationConfig.aspectRatio.width,
  );
}

function expectedMediaType(format) {
  return format === "avif" ? "image/avif" : `image/${format}`;
}

function expectedDecoderFormat(format) {
  // libvips reports AVIF through its HEIF decoder.
  return format === "avif" ? "heif" : format;
}

async function inspectAsset(file, format, width) {
  if (!existsSync(file)) {
    throw new Error(
      `${repoPath(file)} is missing; run npm run generate:hero-assets`,
    );
  }

  const bytes = readFileSync(file);
  const metadata = await sharp(bytes).metadata();
  const height = expectedHeight(width);

  if (metadata.width !== width || metadata.height !== height) {
    throw new Error(
      `${repoPath(file)} has unexpected dimensions ${metadata.width}x${metadata.height}`,
    );
  }
  if (
    metadata.format !== expectedDecoderFormat(format) ||
    metadata.mediaType !== expectedMediaType(format)
  ) {
    throw new Error(
      `${repoPath(file)} is not a valid ${format.toUpperCase()} image`,
    );
  }
  if (metadata.hasAlpha !== true) {
    throw new Error(`${repoPath(file)} must retain transparency`);
  }
  if (bytes.length > generationConfig.maxBytes) {
    throw new Error(`${repoPath(file)} exceeds the 300 KB asset budget`);
  }

  return {
    path: repoPath(file),
    sha256: sha256(bytes),
    bytes: bytes.length,
    width,
    height,
    format,
    mediaType: metadata.mediaType,
    hasAlpha: true,
  };
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message);
  }
}

async function checkManifest() {
  // Sharp encoder output can vary across OS/libvips builds. Verify the
  // committed bytes against generation provenance instead of re-encoding.
  if (!existsSync(manifestPath)) {
    throw new Error(
      `${repoPath(manifestPath)} is missing; run npm run generate:hero-assets`,
    );
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`${repoPath(manifestPath)} is not valid JSON`, {
      cause: error,
    });
  }

  assertEqual(manifest.schemaVersion, 1, "Unsupported hero provenance schema");
  assertEqual(
    manifest.source?.path,
    repoPath(sourcePath),
    "Hero provenance source path drifted",
  );
  assertEqual(
    manifest.source?.sha256,
    sha256(source),
    "Hero source is stale; run npm run generate:hero-assets",
  );
  assertEqual(
    manifest.generator?.path,
    repoPath(generatorPath),
    "Hero provenance generator path drifted",
  );
  assertEqual(
    manifest.generator?.sha256,
    sha256(readFileSync(generatorPath)),
    "Hero generator is stale; run npm run generate:hero-assets",
  );

  const currentConfigJson = canonicalJson(generationConfig);
  assertEqual(
    manifest.config?.sha256,
    sha256(currentConfigJson),
    "Hero generation config is stale; run npm run generate:hero-assets",
  );
  assertEqual(
    canonicalJson(manifest.config?.value),
    currentConfigJson,
    "Hero provenance does not contain the active generation config",
  );

  const expectedCount = widths.length * formats.length;
  if (
    !Array.isArray(manifest.assets) ||
    manifest.assets.length !== expectedCount
  ) {
    throw new Error(
      `Hero provenance must describe exactly ${expectedCount} assets`,
    );
  }
  const manifestAssets = new Map(
    manifest.assets.map((asset) => [asset.path, asset]),
  );
  if (manifestAssets.size !== expectedCount) {
    throw new Error("Hero provenance contains duplicate asset paths");
  }

  for (const width of widths) {
    for (const format of formats) {
      const destination = join(
        imagesDir,
        `hero-neutral-phones-${width}.${format}`,
      );
      const actual = await inspectAsset(destination, format, width);
      const recorded = manifestAssets.get(actual.path);

      if (!recorded) {
        throw new Error(`Hero provenance is missing ${actual.path}`);
      }
      assertEqual(
        canonicalJson(recorded),
        canonicalJson(actual),
        `${actual.path} does not match its provenance; run npm run generate:hero-assets`,
      );
      console.log(
        `${actual.path} ${actual.width}x${actual.height} ${Math.ceil(actual.bytes / 1024)} KB verified`,
      );
    }
  }
}

async function generateAssets() {
  const assets = [];

  for (const width of widths) {
    for (const format of formats) {
      const destination = join(
        imagesDir,
        `hero-neutral-phones-${width}.${format}`,
      );
      const raster = sharp(source, {
        density: generationConfig.density,
      }).resize({
        width,
        height: expectedHeight(width),
        fit: "fill",
      });
      const generated = await (format === "avif"
        ? raster.avif(generationConfig.formats.avif)
        : raster.webp(generationConfig.formats.webp)
      ).toBuffer();

      writeFileSync(destination, generated);
      const asset = await inspectAsset(destination, format, width);
      assets.push(asset);
      console.log(
        `${asset.path} ${asset.width}x${asset.height} ${Math.ceil(asset.bytes / 1024)} KB`,
      );
    }
  }

  for (const width of widths) {
    for (const format of formats) {
      rmSync(join(imagesDir, `hero-dashboard-phones-${width}.${format}`), {
        force: true,
      });
    }
  }

  const configJson = canonicalJson(generationConfig);
  const manifest = {
    schemaVersion: 1,
    source: {
      path: repoPath(sourcePath),
      sha256: sha256(source),
    },
    generator: {
      path: repoPath(generatorPath),
      sha256: sha256(readFileSync(generatorPath)),
    },
    config: {
      sha256: sha256(configJson),
      value: generationConfig,
    },
    generatedWith: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      sharp: sharp.versions.sharp,
      libvips: sharp.versions.vips,
    },
    assets,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

if (!sourceMarkup.includes('viewBox="0 0 1600 1200"')) {
  throw new Error("Hero source must retain the canonical 4:3 viewBox");
}
if (/<text\b|<image\b|data:image|xlink:href/i.test(sourceMarkup)) {
  throw new Error(
    "Hero source must remain a text-free native vector without embedded screenshots",
  );
}

if (checkOnly) {
  await checkManifest();
} else {
  await generateAssets();
}
