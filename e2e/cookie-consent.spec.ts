import { test, expect } from "@playwright/test";

/**
 * Issue #7 — PDPA/GDPR cookie consent. The banner must appear on first visit,
 * gate non-essential trackers until accepted, persist the choice, expose a real
 * preference centre, and be re-openable from the footer. The LINE tag
 * (`#line-tag-base`) is the observable marketing tracker.
 *
 * Run against the static export (PLAYWRIGHT_SERVE_STATIC=1) so the production
 * build's LINE tag is active and gating is exercised.
 */
const CONSENT_KEY = "gogocash.cookie_consent";
const LINE_SCRIPT = "#line-tag-base";
const EN_BANNER = /Cookies & your privacy/;
const EN_PREFERENCES = /Cookie preferences/;

test.describe("cookie consent (#7)", () => {
  test("first visit: gated before consent, accept persists + enables tracker", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    const banner = page.getByRole("dialog", { name: EN_BANNER });
    await expect(banner).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept all" })).not.toBeFocused();

    // Opt-in: no LINE tag before a decision.
    await expect(page.locator(LINE_SCRIPT)).toHaveCount(0);

    await page.getByRole("button", { name: "Accept all" }).click();
    await expect(banner).toBeHidden();

    const stored = await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY);
    expect(stored).toContain('"analytics":true');
    expect(stored).toContain('"marketing":true');

    // Tracker loads only after consent.
    await expect(page.locator(LINE_SCRIPT)).toHaveCount(1, { timeout: 10_000 });

    await page.reload();
    await expect(page.getByRole("dialog", { name: EN_BANNER })).toBeHidden();
  });

  test("reject persists and keeps trackers off", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("button", { name: "Reject non-essential" }).click();
    await expect(page.getByRole("main")).toBeFocused();

    const stored = await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY);
    expect(stored).toContain('"analytics":false');
    expect(stored).toContain('"marketing":false');
    await expect(page.locator(LINE_SCRIPT)).toHaveCount(0);
  });

  test("custom preferences can allow analytics while keeping marketing off", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("button", { name: "Customize" }).click();

    const preferences = page.getByRole("dialog", { name: EN_PREFERENCES });
    await expect(preferences).toBeVisible();
    await page.getByLabel("Analytics cookies").check();
    await expect(page.getByLabel("Marketing cookies")).not.toBeChecked();
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(preferences).toBeHidden();

    const stored = await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY);
    expect(stored).toContain('"analytics":true');
    expect(stored).toContain('"marketing":false');
    await expect(page.locator(LINE_SCRIPT)).toHaveCount(0);
  });

  test("analytics consent keeps every Google advertising signal denied", async ({
    page,
  }) => {
    const advertisingRequests: string[] = [];
    page.on("request", (request) => {
      if (/doubleclick|adservice/i.test(request.url())) {
        advertisingRequests.push(request.url());
      }
    });
    await page.route("https://www.googletagmanager.com/**", (route) =>
      route.fulfill({ contentType: "application/javascript", body: "" }),
    );

    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("button", { name: "Customize" }).click();
    await page.getByLabel("Analytics cookies").check();
    await page.getByRole("button", { name: "Save preferences" }).click();

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const dataLayer = (
              window as Window & { dataLayer?: Array<ArrayLike<unknown>> }
            ).dataLayer ?? [];
            const command = dataLayer
              .map((entry) => Array.from(entry))
              .find(
                (entry) =>
                  entry[0] === "consent" &&
                  (entry[1] === "default" || entry[1] === "update"),
              );
            return command?.[2] ?? null;
          }),
        { timeout: 10_000 },
      )
      .toEqual({
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    expect(advertisingRequests).toEqual([]);
  });

  test("footer Cookie Settings opens the preference centre after a decision", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("button", { name: "Accept all" }).click();
    await expect(page.getByRole("dialog", { name: EN_BANNER })).toBeHidden();

    await page.getByRole("button", { name: "Cookie Settings" }).click();
    await expect(page.getByRole("dialog", { name: EN_PREFERENCES })).toBeVisible();
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByRole("button", { name: "Cookie Settings" })).toBeFocused();
  });

  test("revocation in one tab tears down trackers in another tab", async ({
    context,
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await page.getByRole("button", { name: "Accept all" }).click();
    await expect(page.locator(LINE_SCRIPT)).toHaveCount(1, { timeout: 10_000 });

    const settingsPage = await context.newPage();
    await settingsPage.goto("/", { waitUntil: "load", timeout: 90_000 });
    await settingsPage.getByRole("button", { name: "Cookie Settings" }).click();
    await settingsPage.getByLabel("Analytics cookies").uncheck();
    await settingsPage.getByLabel("Marketing cookies").uncheck();
    await settingsPage.getByRole("button", { name: "Save preferences" }).click();

    await expect(page.locator(LINE_SCRIPT)).toHaveCount(0, { timeout: 10_000 });
    await settingsPage.close();
  });

  test("shows Thai copy on the /th route", async ({ page }) => {
    await page.goto("/th", { waitUntil: "load", timeout: 90_000 });
    await expect(
      page.getByRole("dialog", { name: /คุกกี้และความเป็นส่วนตัว/ }),
    ).toBeVisible();
  });
});
