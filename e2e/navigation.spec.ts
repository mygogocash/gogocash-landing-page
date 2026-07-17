import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("footer omits email capture while signup is paused", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.locator('input[type="email"]')).toHaveCount(0);
    await expect(
      footer.getByRole("button", { name: /subscribe/i }),
    ).toHaveCount(0);
  });

  test("serves responsive hero assets from the artifact under test", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    const hero = page.locator(
      '#home img[src*="hero-neutral-phones-"][alt=""]',
    );
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();
    const asset = await hero.evaluate((image: HTMLImageElement) => ({
      currentSrc: image.currentSrc,
      naturalWidth: image.naturalWidth,
      pageOrigin: window.location.origin,
    }));
    expect(asset.naturalWidth).toBeGreaterThan(0);
    expect(new URL(asset.currentSrc).origin).toBe(asset.pageOrigin);
  });

  test("does not prefetch public discovery files as App Router pages", async ({
    page,
  }) => {
    const invalidPrefetches: string[] = [];
    page.on("request", (request) => {
      if (
        /\/(?:sitemap\.md|llms\.txt|skills\.md|rss\.xml)\/__next\._tree\.txt/.test(
          request.url(),
        )
      ) {
        invalidPrefetches.push(request.url());
      }
    });

    await page.goto("/missing-page", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(invalidPrefetches).toEqual([]);
  });

  test("locale menu: choosing Thai goes to /th", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("button", { name: "Language and region" }).click();
    const panel = page.getByRole("dialog", {
      name: "Choose language and region",
    });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("button", { name: /English/ })).toBeFocused();
    await panel.getByRole("button", { name: /ไทย/ }).click();
    await expect(page).toHaveURL(/\/th\/?(\?.*)?$/);
    await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
  });

  test("locale dialog and mobile navigation close with Escape and restore focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    const localeTrigger = page.getByRole("button", { name: "Language and region" });
    await localeTrigger.click();
    await page.keyboard.press("Escape");
    await expect(localeTrigger).toBeFocused();

    const menuTrigger = page.getByRole("button", { name: /menu/i });
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(menuTrigger).toBeFocused();
  });

  test("header Learn link (desktop) opens learn hub", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Learn" })
      .click();
    await expect(page).toHaveURL(/\/learn\/?(\?.*)?$/);
    await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
  });

  test("header Quest link (desktop) sits after Learn and opens app quests", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    const mainNav = page.getByRole("navigation", { name: "Main navigation" });
    const links = mainNav.getByRole("link");
    const labels = await links.evaluateAll((items) =>
      items.map((item) => item.textContent?.trim() ?? ""),
    );
    const learnIndex = labels.indexOf("Learn");
    const questIndex = labels.indexOf("Quest");

    expect(learnIndex).toBeGreaterThanOrEqual(0);
    expect(questIndex).toBe(learnIndex + 1);
    await expect(mainNav.getByRole("link", { name: "Quest" })).toHaveAttribute(
      "href",
      "https://app.gogocash.co/en/quest",
    );
  });
});
