import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getLearnArticles } from "./learn-data";
import { LEARN_ARTICLES } from "./learn-articles";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  globalThis.fetch = ORIGINAL_FETCH;
});

describe("learn-data Strapi fallbacks", () => {
  it("uses local LEARN_ARTICLES when STRAPI_URL is unset", async () => {
    delete process.env.STRAPI_URL;
    const articles = await getLearnArticles();
    assert.deepEqual(articles, LEARN_ARTICLES);
  });

  it("falls back to local when Strapi fetch throws", async () => {
    process.env.STRAPI_URL = "https://cms.example.test";
    globalThis.fetch = async () => {
      throw new Error("network down");
    };
    const articles = await getLearnArticles();
    assert.deepEqual(articles, LEARN_ARTICLES);
  });

  it("falls back to local when Strapi returns an empty list", async () => {
    process.env.STRAPI_URL = "https://cms.example.test";
    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({ data: [] }),
      }) as Response;
    const articles = await getLearnArticles();
    assert.deepEqual(articles, LEARN_ARTICLES);
  });

  it("keeps Strapi publication and modification dates separate", async () => {
    process.env.STRAPI_URL = "https://cms.example.test";
    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              slug: "published-once-updated-later",
              title: "Published once, updated later",
              metaTitle: "Published once, updated later | GoGoCash Learn",
              metaDescription: "Metadata date regression fixture.",
              hubDesc: "Metadata date regression fixture.",
              publishedAt: "2026-03-22T00:00:00.000Z",
              updatedAt: "2026-07-15T00:00:00.000Z",
            },
          ],
        }),
      }) as Response;

    const [article] = await getLearnArticles();
    assert.equal(article.published, "March 22, 2026");
    assert.equal(article.updated, "July 15, 2026");
  });
});
