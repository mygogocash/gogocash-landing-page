"use client";

import { useCallback } from "react";
import { logLaunchAppClick } from "@/lib/analytics-client";
import {
  DEFAULT_DESKTOP_LAUNCH_TARGET,
  DEFAULT_MOBILE_LAUNCH_TARGET,
  launchTargetBehavior,
  type DesktopLaunchTarget,
  type MobileLaunchTarget,
} from "@/lib/launch-app-target";
import { mixpanelDistinctId } from "@/lib/mixpanel-client";
import { sendLineTagConversion } from "@/lib/line-tag";

/**
 * Carry the Mixpanel distinct_id to the app so the landing visitor and their app
 * session resolve to one user. The web app (app.gogocash.co) already shares it
 * via the cross-subdomain cookie; the LINE mini app is a different domain, so it
 * needs the id on the URL. No-op until consent + init (returns the original href).
 */
function withDistinctId(href: string): string {
  const id = mixpanelDistinctId();
  if (!id) return href;
  try {
    const url = new URL(href);
    url.searchParams.set("mp_distinct_id", id);
    return url.toString();
  } catch {
    return href;
  }
}

type LaunchAppLinkProps = {
  className: string;
  children: React.ReactNode;
  /** Where on the page this CTA sits (hero, final, feature, header, quests). */
  surface?: string;
  desktopTarget?: DesktopLaunchTarget;
  mobileTarget?: MobileLaunchTarget;
};

/**
 * Defaults to the web app on desktop and LINE Mini App on mobile. Callers may
 * atomically override either typed target (for example, Quests uses web on both).
 * Pass full button styles in `className`; visibility toggles are applied here.
 */
export default function LaunchAppLink({
  className,
  children,
  surface = "unknown",
  desktopTarget = DEFAULT_DESKTOP_LAUNCH_TARGET,
  mobileTarget = DEFAULT_MOBILE_LAUNCH_TARGET,
}: LaunchAppLinkProps) {
  const external = {
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
  };

  const onDesktop = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Rewrite href just-in-time so the navigation carries the distinct_id.
      event.currentTarget.href = withDistinctId(desktopTarget.href);
      const behavior = launchTargetBehavior("desktop", desktopTarget);
      logLaunchAppClick(behavior.destination, surface);
    },
    [desktopTarget, surface],
  );
  const onMobile = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.currentTarget.href = withDistinctId(mobileTarget.href);
      const behavior = launchTargetBehavior("mobile", mobileTarget);
      logLaunchAppClick(behavior.destination, surface);
      if (behavior.sendLineConversion) sendLineTagConversion();
    },
    [mobileTarget, surface],
  );

  return (
    <>
      <a
        href={desktopTarget.href}
        {...external}
        onClick={onDesktop}
        className={`${className} hidden md:inline-flex`}
      >
        {children}
      </a>
      <a
        href={mobileTarget.href}
        {...external}
        onClick={onMobile}
        className={`${className} inline-flex md:hidden`}
      >
        {children}
      </a>
    </>
  );
}
