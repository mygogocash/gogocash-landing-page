import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  fetchStrapiLearnArticleBySlug,
  fetchStrapiLearnIndex,
} from "./strapi-learn";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  globalThis.fetch = ORIGINAL_FETCH;
});

describe("strapi-learn", () => {
  it("returns published Learn article metadata from Strapi", async () => {
    process.env.STRAPI_URL = "https://cms.example.test/";
    process.env.STRAPI_API_TOKEN = "read-token";

    let requestedUrl = "";
    let requestedAuth = "";
    globalThis.fetch = async (input, init) => {
      requestedUrl = String(input);
      requestedAuth = String((init?.headers as Record<string, string>).Authorization);
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              attributes: {
                slug: "how-cashback-works",
                title: "How cashback tracking works",
                metaTitle: "How Cashback Tracking Works | GoGoCash Learn",
                metaDescription: "Tracking explanation.",
                hubDesc: "From click to merchant confirmation.",
                publishedAt: "2026-03-22T00:00:00.000Z",
              },
            },
          ],
        }),
      } as Response;
    };

    const articles = await fetchStrapiLearnIndex();
    assert.equal(requestedAuth, "Bearer read-token");
    assert.match(requestedUrl, /^https:\/\/cms\.example\.test\/api\/learn-articles\?/);
    assert.match(requestedUrl, /filters%5BpublishedAt%5D%5B%24notNull%5D=true/);
    assert.deepEqual(articles, [
      {
        slug: "how-cashback-works",
        title: "How cashback tracking works",
        metaTitle: "How Cashback Tracking Works | GoGoCash Learn",
        metaDescription: "Tracking explanation.",
        hubDesc: "From click to merchant confirmation.",
        updated: "March 22, 2026",
      },
    ]);
  });

  it("returns a single article with markdown content", async () => {
    process.env.STRAPI_URL = "https://cms.example.test";

    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({
          data: [
            {
              documentId: "abc",
              slug: "saving-plus-explained",
              title: "Saving Plus in plain language",
              metaTitle: "Saving Plus Explained | GoGoCash Learn",
              metaDescription: "Saving Plus explanation.",
              hubDesc: "Plain language overview.",
              content: "## What Saving Plus is\n\nBody.",
              updatedAt: "2026-06-03T00:00:00.000Z",
            },
          ],
        }),
      }) as Response;

    const article = await fetchStrapiLearnArticleBySlug("saving-plus-explained");
    assert.deepEqual(article, {
      meta: {
        slug: "saving-plus-explained",
        title: "Saving Plus in plain language",
        metaTitle: "Saving Plus Explained | GoGoCash Learn",
        metaDescription: "Saving Plus explanation.",
        hubDesc: "Plain language overview.",
        updated: "June 3, 2026",
      },
      markdown: "## What Saving Plus is\n\nBody.",
    });
  });
});
