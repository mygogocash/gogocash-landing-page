import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("prevents JSON-LD values from breaking out of the script element", () => {
    const serialized = serializeJsonLd({
      value: "</script><script>alert(1)</script>&\u2028\u2029",
    });
    assert.equal(serialized.includes("<"), false);
    assert.equal(serialized.includes("&"), false);
    assert.match(serialized, /\\u003c\/script\\u003e/);
    assert.match(serialized, /\\u0026/);
    assert.match(serialized, /\\u2028/);
    assert.match(serialized, /\\u2029/);
  });
});
