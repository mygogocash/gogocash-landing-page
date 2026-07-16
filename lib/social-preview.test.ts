import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OG_IMAGE_PATH,
  buildWebsiteSocialMetadata,
} from "./social-preview";

describe("buildWebsiteSocialMetadata", () => {
  it("returns a complete localized Open Graph and Twitter card", () => {
    const social = buildWebsiteSocialMetadata({
      title: "หน้าทดสอบ",
      description: "คำอธิบายภาษาไทย",
      locale: "th_TH",
      url: "/th",
    });

    assert.equal(social.openGraph?.type, "website");
    assert.equal(social.openGraph?.locale, "th_TH");
    assert.equal(social.openGraph?.url, "/th");
    assert.equal(social.openGraph?.siteName, "GoGoCash");
    assert.equal(social.openGraph?.title, "หน้าทดสอบ");
    assert.equal(social.openGraph?.description, "คำอธิบายภาษาไทย");
    assert.deepEqual(social.openGraph?.images, [
      {
        url: OG_IMAGE_PATH,
        width: 1024,
        height: 537,
        alt: "GoGoCash — earn cashback on every spend with top brands",
      },
    ]);
    assert.deepEqual(social.twitter, {
      card: "summary_large_image",
      title: "หน้าทดสอบ",
      description: "คำอธิบายภาษาไทย",
      images: [OG_IMAGE_PATH],
    });
  });
});
