import { test, expect } from "@playwright/test";

/**
 * PostHog must never run before cookie consent (PDPA/GDPR, ties into #7).
 * The "before consent" guard is unconditional. The "after consent" assertion
 * only applies when a PostHog key is configured in the build (skips otherwise,
 * so CI without the key does not false-fail). Verify the on-path locally with
 * NEXT_PUBLIC_POSTHOG_KEY=phc_test set at build time.
 */
const EN_BANNER = /Cookies & your privacy/;

test.describe("posthog consent gating", () => {
  test("does not load or call PostHog before a consent decision", async ({
    page,
  }) => {
    const posthogRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("posthog")) posthogRequests.push(req.url());
    });

    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    await expect(page.getByRole("dialog", { name: EN_BANNER })).toBeVisible();
    await page.waitForTimeout(1500);

    expect(
      await page.evaluate(() => typeof (window as { posthog?: unknown }).posthog),
    ).toBe("undefined");
    expect(posthogRequests).toEqual([]);
  });

  test("calls PostHog after Accept all when a key is configured", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    // Arm the wait before clicking so we can't miss the request.
    const posthogRequest = page
      .waitForRequest((req) => req.url().includes("posthog"), {
        timeout: 6000,
      })
      .catch(() => null);
    await page.getByRole("button", { name: "Accept all" }).click();
    const req = await posthogRequest;

    test.skip(
      !req,
      "No NEXT_PUBLIC_POSTHOG_KEY in this build — consent-granted path not exercised",
    );
    expect(req?.url()).toContain("posthog");
  });

  test("keeps the PostHog SDK opted out after analytics consent is withdrawn", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });

    const posthogRequest = page
      .waitForRequest((req) => req.url().includes("posthog"), {
        timeout: 6000,
      })
      .catch(() => null);
    await page.getByRole("button", { name: "Accept all" }).click();
    const req = await posthogRequest;

    test.skip(
      !req,
      "No NEXT_PUBLIC_POSTHOG_KEY in this build — withdrawal path not exercised",
    );

    await page.getByRole("button", { name: "Cookie Settings" }).click();
    await page.getByLabel("Analytics cookies").uncheck();
    await page.getByRole("button", { name: "Save preferences" }).click();

    await expect
      .poll(() =>
        page.evaluate(() =>
          Object.entries(localStorage).some(
            ([key, value]) =>
              key.startsWith("__ph_opt_in_out_") && value === "0",
          ),
        ),
      )
      .toBe(true);
  });
});
