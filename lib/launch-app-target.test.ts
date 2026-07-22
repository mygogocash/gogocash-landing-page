import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_DESKTOP_LAUNCH_TARGET,
  DEFAULT_MOBILE_LAUNCH_TARGET,
  launchTargetBehavior,
} from "./launch-app-target";

describe("launch app target contract", () => {
  it("keeps the default desktop and mobile destinations aligned with navigation", () => {
    assert.deepEqual(
      launchTargetBehavior("desktop", DEFAULT_DESKTOP_LAUNCH_TARGET),
      {
        destination: "web_desktop",
        sendLineConversion: false,
      },
    );
    assert.deepEqual(
      launchTargetBehavior("mobile", DEFAULT_MOBILE_LAUNCH_TARGET),
      {
        destination: "web_mobile",
        sendLineConversion: false,
      },
    );
  });

  it("treats a mobile web override as web analytics without LINE conversion", () => {
    assert.deepEqual(
      launchTargetBehavior("mobile", {
        kind: "web",
        href: "https://app.gogocash.co/en/quest",
      }),
      {
        destination: "web_mobile",
        sendLineConversion: false,
      },
    );
  });

  it("still supports an explicit LINE Mini App mobile override", () => {
    assert.deepEqual(
      launchTargetBehavior("mobile", {
        kind: "line",
        href: "https://miniapp.line.me/2008237918-mpplkp5Q",
      }),
      {
        destination: "line_mobile",
        sendLineConversion: true,
      },
    );
  });
});
