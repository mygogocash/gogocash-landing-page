import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodePublicPath } from "./encode-public-path";

describe("encodePublicPath", () => {
  it("encodes spaces in path segments", () => {
    assert.equal(
      encodePublicPath("/images/partner logos/foo.png"),
      "/images/partner%20logos/foo.png",
    );
  });

  it("leaves paths without special chars unchanged (aside from normalization)", () => {
    assert.equal(
      encodePublicPath("/images/partner-logos/shopee.png"),
      "/images/partner-logos/shopee.png",
    );
  });

  it("returns non-root paths as-is", () => {
    assert.equal(encodePublicPath("relative"), "relative");
  });

  it("does not double-encode already encoded segments", () => {
    assert.equal(
      encodePublicPath("/images/partner-logos/Air%20India%20-%20CPS.png"),
      "/images/partner-logos/Air%20India%20-%20CPS.png",
    );
  });
});
