import QRCode from "qrcode";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    return (await import("next/node_modules/sharp/lib/index.js")).default;
  }
}

const sharp = await loadSharp();

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, "..", "public", "images");
const partnerLogosDir = join(imagesDir, "partner-logos");
const optimizedPartnerLogosDir = join(partnerLogosDir, "optimized");
mkdirSync(imagesDir, { recursive: true });
mkdirSync(optimizedPartnerLogosDir, { recursive: true });

const brand = { r: 4, g: 120, b: 87 };

/** OG image for link previews is `public/images/gogocash-social-preview.jpg` (committed). */

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { ...brand, alpha: 1 },
  },
})
  .png()
  .toFile(join(imagesDir, "gogocash-logo.png"));

const logoMarkBuffer = await sharp(join(imagesDir, "gogocash-logo-mark.png"))
  .resize(256, 256, {
    fit: "contain",
    withoutEnlargement: true,
  })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
await sharp(logoMarkBuffer).toFile(join(imagesDir, "gogocash-logo-mark.png"));
await sharp(logoMarkBuffer)
  .resize(64, 64, {
    fit: "contain",
    withoutEnlargement: true,
  })
  .png({ compressionLevel: 9, palette: true })
  .toFile(join(imagesDir, "gogocash-logo-mark-ui.png"));

await sharp(join(imagesDir, "hero-dashboard-phones.svg"), {
  density: 144,
})
  .resize(800, 600, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 72, effort: 6 })
  .toFile(join(imagesDir, "hero-dashboard-phones.webp"));

const howItWorksImages = [
  "browse-and-pick-your-brand",
  "shop-the-way-you-already-do",
  "cashback-after-the-merchant-confirms",
];

for (const name of howItWorksImages) {
  await sharp(join(imagesDir, "how-it-works", `${name}.svg`), {
    density: 96,
  })
    .resize(720, 720, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toFile(join(imagesDir, "how-it-works", `${name}.webp`));
}

let optimizedPartnerCount = 0;
for (const file of readdirSync(partnerLogosDir)) {
  if (!file.toLowerCase().endsWith(".png")) continue;
  const input = join(partnerLogosDir, file);
  if (!statSync(input).isFile()) continue;
  await sharp(input)
    .resize(88, 88, {
      fit: "contain",
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .webp({ quality: 76, effort: 6 })
    .toFile(join(optimizedPartnerLogosDir, file.replace(/\.png$/i, ".webp")));
  optimizedPartnerCount += 1;
}

/** Must match `LINE_MINI_APP_HREF` in components/social-data.ts */
const lineMiniAppUrl = "https://miniapp.line.me/2008237918-mpplkp5Q";

const qrLinePng = await QRCode.toBuffer(lineMiniAppUrl, {
  type: "png",
  width: 400,
  margin: 2,
  color: { dark: "#1f2937ff", light: "#ffffffff" },
});
await sharp(qrLinePng)
  .flatten({ background: "#ffffff" })
  .webp({ quality: 90 })
  .toFile(join(imagesDir, "qr-gogocash-line-miniapp.webp"));

console.log(
  `Wrote SEO assets, optimized hero/how-it-works images, and ${optimizedPartnerCount} partner logos (OG: gogocash-social-preview.jpg is hand-maintained)`,
);
