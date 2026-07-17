import { test, expect } from "@playwright/test";

const HOMEPAGE_ROUTES = [
  {
    route: "/",
    title: "Turn everyday shopping into bonus cashback",
    cta: "See live quests in the app",
  },
  {
    route: "/en",
    title: "Turn everyday shopping into bonus cashback",
    cta: "See live quests in the app",
  },
  {
    route: "/th",
    title: "เปลี่ยนการช้อปทุกวันให้เป็นแคชแบ็กโบนัส",
    cta: "ดูเควสต์ที่เปิดอยู่",
  },
  {
    route: "/id",
    title: "Ubah belanja sehari-hari menjadi cashback ekstra",
    cta: "Lihat quest aktif",
  },
  {
    route: "/ja",
    title: "いつものお買い物でボーナスキャッシュバック",
    cta: "開催中のクエストを見る",
  },
  {
    route: "/tw",
    title: "讓日常消費變成額外現金回饋",
    cta: "查看進行中的任務",
  },
  {
    route: "/cn",
    title: "让日常消费变成额外现金回馈",
    cta: "查看进行中的任务",
  },
] as const;
const QUEST_HREF = "https://app.gogocash.co/en/quest";

/**
 * Wave 5 — #14 (consolidate the two "Why" sections), #15 (Quests section),
 * #16 (differentiation table). The EN home must show one Why section plus the
 * new Quests + "why switch" sections, with the redundant "Why it adds up" gone.
 */
test.describe("home sections (#14/#15/#16)", () => {
  test("EN home has Quests + differentiation and no duplicate Why section", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    // #15 Quests + #16 differentiation present
    await expect(page.locator("#quests")).toHaveCount(1);
    await expect(page.locator("#why-switch")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "GoGoCash vs other cashback apps" }),
    ).toBeVisible();

    // #14 the redundant "Why it adds up" section is removed
    await expect(page.getByText("Why it adds up")).toHaveCount(0);
    // the consolidated "Why GoGoCash" section remains
    await expect(page.getByText("Why GoGoCash", { exact: true })).toBeVisible();
  });

  for (const { route, title, cta } of HOMEPAGE_ROUTES) {
    test(`${route} has one complete Quests section with direct app links`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "load", timeout: 90_000 });

      const quests = page.locator("#quests");
      await expect(quests).toHaveCount(1);
      await expect(
        quests.getByRole("heading", { level: 2, name: title }),
      ).toBeVisible();
      await expect(quests.getByRole("heading", { level: 3 })).toHaveCount(3);
      await expect(quests.getByText(cta, { exact: true })).toHaveCount(2);

      const links = quests.locator("a[href]");
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toHaveAttribute("href", QUEST_HREF);
      await expect(links.nth(1)).toHaveAttribute("href", QUEST_HREF);

      const hero = page.locator(
        '#home img[src*="hero-neutral-phones-"][alt=""]',
      );
      await expect(hero).toHaveCount(1);
      await expect(hero).toBeVisible();

    });
  }

  test("Quest CTA remains visible on keyboard focus and icons stay decorative", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    const quests = page.locator("#quests");
    const cta = quests
      .getByRole("link", { name: "See live quests in the app" })
      .last();
    await cta.focus();

    const animatedAncestorOpacity = await cta.evaluate((link) => {
      const animatedAncestor = link.closest(".animate-on-scroll");
      return animatedAncestor
        ? getComputedStyle(animatedAncestor).opacity
        : getComputedStyle(link).opacity;
    });
    expect(animatedAncestorOpacity).toBe("1");
    await expect(quests.locator('svg:not([aria-hidden="true"])')).toHaveCount(0);
  });
});
