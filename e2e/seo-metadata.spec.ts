import { expect, test, type Page } from "@playwright/test";

async function jsonLdBlocks(page: Page): Promise<Record<string, unknown>[]> {
  const values = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return values.map((value) => JSON.parse(value) as Record<string, unknown>);
}

test.describe("SEO metadata", () => {
  test("legal pages emit intentional canonicals without homepage hreflang", async ({
    page,
  }) => {
    for (const [path, canonical] of [
      ["/privacy-policy", "https://gogocash.co/privacy-policy"],
      ["/term-of-use", "https://gogocash.co/term-of-use"],
      ["/terms-of-service", "https://gogocash.co/term-of-use"],
    ] as const) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        canonical,
      );
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
        0,
      );
    }
  });

  test("locale pages emit complete localized social cards", async ({ page }) => {
    for (const [path, title] of [
      ["/en", "Earn Cashback on Every Spend with GoGoCash"],
      ["/th", "GoGoCash — แคชแบ็กจริงทั่วเอเชียตะวันออกเฉียงใต้"],
      ["/ja", "GoGoCash — 東南アジアで使えるキャッシュバック"],
      ["/cn", "GoGoCash — 东南亚现金回馈平台"],
      ["/tw", "GoGoCash — 東南亞現金回饋平台"],
      ["/id", "GoGoCash — Cashback nyata di Asia Tenggara"],
    ] as const) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        "content",
        "website",
      );
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
        "content",
        "GoGoCash",
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        "https://gogocash.co/images/gogocash-social-preview.jpg",
      );
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
        "content",
        title,
      );
    }
  });

  test("global and Article JSON-LD use verifiable fields", async ({ page }) => {
    await page.goto("/learn/how-cashback-works", {
      waitUntil: "domcontentloaded",
    });
    const blocks = await jsonLdBlocks(page);
    const website = blocks.find((block) => block["@type"] === "WebSite");
    const mobileApp = blocks.find(
      (block) => block["@type"] === "MobileApplication",
    );
    const article = blocks.find((block) => block["@type"] === "Article");

    expect(website?.name).toBe("GoGoCash");
    expect(mobileApp).not.toHaveProperty("aggregateRating");
    expect(article?.datePublished).toBe("2026-03-22");
    expect(article?.dateModified).toBe("2026-03-22");
    expect(article?.image).toEqual([
      "https://gogocash.co/images/gogocash-social-preview.jpg",
    ]);
  });
});
