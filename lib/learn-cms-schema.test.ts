import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const schemaPath = join(
  process.cwd(),
  "cms",
  "strapi",
  "src",
  "api",
  "learn-article",
  "content-types",
  "learn-article",
  "schema.json",
);

type StrapiAttribute = {
  type?: string;
  required?: boolean;
  targetField?: string;
};

type StrapiSchema = {
  kind?: string;
  info?: {
    singularName?: string;
    pluralName?: string;
  };
  options?: {
    draftAndPublish?: boolean;
  };
  attributes?: Record<string, StrapiAttribute>;
};

function readSchema(): StrapiSchema {
  return JSON.parse(readFileSync(schemaPath, "utf8")) as StrapiSchema;
}

describe("Learn CMS Strapi schema", () => {
  it("matches the API route consumed by the landing build", () => {
    const schema = readSchema();
    assert.equal(schema.kind, "collectionType");
    assert.equal(schema.info?.singularName, "learn-article");
    assert.equal(schema.info?.pluralName, "learn-articles");
    assert.equal(schema.options?.draftAndPublish, true);
  });

  it("requires the fields needed for hub cards, SEO metadata, and article pages", () => {
    const attributes = readSchema().attributes ?? {};
    assert.deepEqual(
      Object.fromEntries(
        [
          "slug",
          "title",
          "metaTitle",
          "metaDescription",
          "hubDesc",
          "content",
        ].map((field) => [field, attributes[field]?.required]),
      ),
      {
        slug: true,
        title: true,
        metaTitle: true,
        metaDescription: true,
        hubDesc: true,
        content: true,
      },
    );
    assert.equal(attributes.slug?.type, "uid");
    assert.equal(attributes.slug?.targetField, "title");
    assert.equal(attributes.content?.type, "richtext");
  });
});
