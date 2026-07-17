import { test, expect } from "@playwright/test";

const HOME_ROUTES = ["/", "/en", "/th", "/id", "/ja", "/tw", "/cn"] as const;

for (const route of HOME_ROUTES) {
  test(`${route} omits the unsupported 6M+ shopper claim`, async ({ page }) => {
    const response = await page.goto(route, {
      waitUntil: "load",
      timeout: 90_000,
    });

    expect(response, `expected navigation response for ${route}`).not.toBeNull();
    expect(response!.status(), `HTTP status for ${route}`).toBe(200);
    await expect(page.locator("body")).not.toContainText(/6M\+/i);
  });
}
