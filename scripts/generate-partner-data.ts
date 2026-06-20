import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadBundledPartnerBrands } from "@/lib/partner-logo-resolve";

const dataDir = join(process.cwd(), "public", "data");
mkdirSync(dataDir, { recursive: true });

const partners = loadBundledPartnerBrands();
writeFileSync(
  join(dataDir, "partner-brands.json"),
  `${JSON.stringify({ partners }, null, 2)}\n`,
);

console.log(`Wrote ${partners.length} partner records to public/data/partner-brands.json`);
