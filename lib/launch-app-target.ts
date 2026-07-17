import type { LaunchAppDestination } from "@/lib/analytics-client";
import { LINE_MINI_APP_HREF, WEB_APP_HREF } from "@/lib/destinations";

export type WebLaunchTarget = {
  kind: "web";
  href: string;
};

export type LineLaunchTarget = {
  kind: "line";
  href: string;
};

export type DesktopLaunchTarget = WebLaunchTarget;
export type MobileLaunchTarget = WebLaunchTarget | LineLaunchTarget;

export const DEFAULT_DESKTOP_LAUNCH_TARGET: DesktopLaunchTarget = {
  kind: "web",
  href: WEB_APP_HREF,
};

export const DEFAULT_MOBILE_LAUNCH_TARGET: MobileLaunchTarget = {
  kind: "line",
  href: LINE_MINI_APP_HREF,
};

type LaunchTargetBehavior = {
  destination: LaunchAppDestination;
  sendLineConversion: boolean;
};

export function launchTargetBehavior(
  device: "desktop",
  target: DesktopLaunchTarget,
): LaunchTargetBehavior;
export function launchTargetBehavior(
  device: "mobile",
  target: MobileLaunchTarget,
): LaunchTargetBehavior;
export function launchTargetBehavior(
  device: "desktop" | "mobile",
  target: MobileLaunchTarget,
): LaunchTargetBehavior {
  if (target.kind === "line") {
    return { destination: "line_mobile", sendLineConversion: true };
  }

  return {
    destination: device === "desktop" ? "web_desktop" : "web_mobile",
    sendLineConversion: false,
  };
}
