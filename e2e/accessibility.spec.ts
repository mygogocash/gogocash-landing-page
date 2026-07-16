import { expect, test } from "@playwright/test";

test.describe("accessibility regressions", () => {
  test("static locale documents expose the correct language", async ({ page }) => {
    const hydrationDiagnostics: string[] = [];
    page.on("console", (message) => {
      if (
        ["warning", "error"].includes(message.type()) &&
        /hydration|did not match|server rendered/i.test(message.text())
      ) {
        hydrationDiagnostics.push(message.text());
      }
    });
    for (const [path, language] of [
      ["/", "en"],
      ["/th", "th"],
      ["/ja", "ja"],
      ["/cn", "zh-Hans"],
      ["/tw", "zh-Hant"],
      ["/id", "id"],
    ] as const) {
      await page.goto(path, { waitUntil: "load", timeout: 90_000 });
      await expect(page.locator("html")).toHaveAttribute("lang", language);
    }
    expect(hydrationDiagnostics).toEqual([]);
  });

  test("skip link moves focus to the main landmark", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toHaveAttribute("href", "#main-content");
    await skip.focus();
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });

  test("collapsed FAQ content is hidden and linked to its trigger", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 90_000 });
    const trigger = page.getByRole("button", {
      name: "How does GoGoCash cashback work?",
    });
    const panelId = await trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = page.locator(`#${panelId}`);
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert", "");
    await page.getByRole("button", { name: "Reject non-essential" }).click();
    await trigger.click();
    await expect(panel).toHaveAttribute("aria-hidden", "false");
    await expect(panel).not.toHaveAttribute("inert", "");
  });
});
