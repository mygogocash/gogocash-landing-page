import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { persistConsent } from "@/lib/cookie-consent";
import { sendLineTagConversion } from "@/lib/line-tag";

describe("LINE Tag conversion consent", () => {
  const hadWindow = Reflect.has(globalThis, "window");
  const previousWindow = hadWindow ? globalThis.window : undefined;
  const previousEnabled = process.env.NEXT_PUBLIC_LINE_TAG_ENABLED;
  let calls: unknown[][];

  beforeEach(() => {
    calls = [];
    const store = new Map<string, string>();
    const win = Object.assign(new EventTarget(), {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, value),
      },
      _lt: (...args: unknown[]) => calls.push(args),
    });
    Object.defineProperty(globalThis, "window", {
      value: win,
      configurable: true,
      writable: true,
    });
    process.env.NEXT_PUBLIC_LINE_TAG_ENABLED = "true";
  });

  afterEach(() => {
    if (previousEnabled === undefined) {
      delete process.env.NEXT_PUBLIC_LINE_TAG_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_LINE_TAG_ENABLED = previousEnabled;
    }
    if (hadWindow) {
      Object.defineProperty(globalThis, "window", {
        value: previousWindow,
        configurable: true,
        writable: true,
      });
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  });

  it("rechecks marketing consent after a previously loaded tag is revoked", () => {
    persistConsent({ analytics: false, marketing: true });
    sendLineTagConversion();
    assert.equal(calls.length, 1);

    persistConsent({ analytics: false, marketing: false });
    sendLineTagConversion();

    assert.equal(calls.length, 1);
  });
});
