import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeHostname,
  normalizeOrigin,
  publicAssetUrl,
} from "./public-asset-url";

describe("normalizeHostname", () => {
  it("strips a trailing dot from FQDN hostnames", () => {
    assert.equal(normalizeHostname("gogocash.co."), "gogocash.co");
  });

  it("leaves normal hostnames unchanged", () => {
    assert.equal(normalizeHostname("gogocash.co"), "gogocash.co");
    assert.equal(normalizeHostname("localhost"), "localhost");
  });
});

describe("normalizeOrigin", () => {
  it("normalizes origins whose hostname ends with a dot", () => {
    assert.equal(normalizeOrigin("https://gogocash.co."), "https://gogocash.co");
  });
});

describe("publicAssetUrl", () => {
  it("keeps paths on the current static host in production builds", () => {
    const env = process.env;
    process.env = { ...env, NODE_ENV: "production" };
    try {
      assert.equal(
        publicAssetUrl("/images/gogocash-logo-mark.png"),
        "/images/gogocash-logo-mark.png",
      );
      assert.equal(
        publicAssetUrl("/images/partner-logos/Air India - CPS.png"),
        "/images/partner-logos/Air%20India%20-%20CPS.png",
      );
    } finally {
      process.env = env;
    }
  });

  it("keeps root-relative paths in development", () => {
    const env = process.env;
    process.env = { ...env, NODE_ENV: "development" };
    try {
      assert.equal(
        publicAssetUrl("/images/gogocash-logo-mark.png"),
        "/images/gogocash-logo-mark.png",
      );
    } finally {
      process.env = env;
    }
  });

  it("uses a normalized origin for trailing-dot hostnames in the browser", () => {
    const env = process.env;
    process.env = { ...env, NODE_ENV: "development" };
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          hostname: "gogocash.co.",
          origin: "https://gogocash.co.",
        },
      },
    });
    try {
      assert.equal(
        publicAssetUrl("/images/gogocash-logo-mark.png"),
        "https://gogocash.co/images/gogocash-logo-mark.png",
      );
    } finally {
      process.env = env;
      if (originalWindow === undefined) {
        delete (globalThis as { window?: Window }).window;
      } else {
        Object.defineProperty(globalThis, "window", {
          configurable: true,
          value: originalWindow,
        });
      }
    }
  });
});
