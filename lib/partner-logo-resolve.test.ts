import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBundledPartnerBrandsFromFilenames,
  loadBundledPartnerBrands,
} from "./partner-logo-resolve";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("bundled partner-logo registry", () => {
  it("returns deterministic unique merchant cards with canonical logo URLs", () => {
    const first = loadBundledPartnerBrands();
    const second = loadBundledPartnerBrands();

    assert.deepEqual(second, first);
    assert.equal(new Set(first.map((partner) => partner.id)).size, first.length);
    assert.equal(new Set(first.map((partner) => partner.name)).size, first.length);
    assert.ok(first.every((partner) => !/-[0-9a-f]{8}-[0-9a-f-]{27}\.png$/i.test(partner.logoUrl)));
  });

  it("classifies representative commerce and travel partners", () => {
    const partners = loadBundledPartnerBrands();
    assert.equal(
      partners.find((partner) => partner.name.toLowerCase().startsWith("shopee"))
        ?.category,
      "E-commerce",
    );
    assert.equal(
      partners.find((partner) => partner.name.toLowerCase() === "agoda")
        ?.category,
      "Travel",
    );
  });

  it("parses legacy, CPS, UUID-suffixed, and plain filename conventions", () => {
    const partners = buildBundledPartnerBrandsFromFilenames(
      [
        "Shopee_TH_-_CPS.png",
        `Trip.com - CPS-${UUID}.png`,
        "Lazada.png",
      ],
      {},
    );

    assert.deepEqual(
      partners.map(({ name, category }) => ({ name, category })),
      [
        { name: "Lazada", category: "E-commerce" },
        { name: "Shopee", category: "E-commerce" },
        { name: "Trip.com", category: "Travel" },
      ],
    );
  });

  it("prefers a human filename over its UUID export and dedupes extensions", () => {
    const partners = buildBundledPartnerBrandsFromFilenames(
      [
        `Example-${UUID}.png`,
        "Example.png",
        "Airpaz Global - CPS.png",
        "Airpaz.png",
      ],
      {},
    );

    assert.equal(
      partners.find((partner) => partner.name === "Example")?.logoUrl,
      "/images/partner-logos/Example.png",
    );
    assert.deepEqual(
      partners.filter((partner) => partner.name.startsWith("Airpaz"))
        .map((partner) => partner.name),
      ["Airpaz"],
    );
  });

  it("filters blocklisted exports and honors pinned canonical logos", () => {
    const partners = buildBundledPartnerBrandsFromFilenames([
      "GQ Thailand - CPS.png",
      "browser-screenshot-49e73c74-7525-4c92-beb8-e85375477a03.png",
      "Shopee_TH_-_CPS.png",
    ]);

    assert.deepEqual(partners.map((partner) => partner.name), ["Shopee"]);
    assert.equal(
      partners[0]?.logoUrl,
      "/images/partner-logos/Shopee TH - CPS.png",
    );
  });
});
