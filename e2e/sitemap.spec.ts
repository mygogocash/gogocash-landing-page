import { test, expect } from "@playwright/test";

test("sitemap.xml returns 200 and contains url entries", async ({
  request,
}) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const ct = res.headers()["content-type"] ?? "";
  expect(
    ct.includes("xml") || ct.includes("text/plain"),
    `unexpected content-type: ${ct}`,
  ).toBeTruthy();
  const body = await res.text();
  expect(body).toMatch(/urlset/i);
  expect(body).toMatch(/<loc>/i);
  for (const path of [
    "/en",
    "/cashback/shopee",
    "/cashback/lazada",
    "/cashback/agoda",
    "/cashback/trip-com",
    "/cashback/aliexpress",
  ]) {
    expect(body).toContain(`https://gogocash.co${path}`);
  }
});
