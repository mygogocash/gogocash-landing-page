"use client";

import { useCallback } from "react";
import { LINE_MINI_APP_HREF, WEB_APP_HREF } from "@/components/social-data";
import { logLaunchAppClick } from "@/lib/analytics-client";
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
};

/**
 * Desktop (md+): opens web app. Mobile: opens LINE Mini App.
 * Pass full button styles in `className`; visibility toggles are applied here.
 */
export default function LaunchAppLink({
  className,
  children,
  surface = "unknown",
}: LaunchAppLinkProps) {
  const external = {
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
  };

  const onWeb = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Rewrite href just-in-time so the navigation carries the distinct_id.
      event.currentTarget.href = withDistinctId(WEB_APP_HREF);
      logLaunchAppClick("web_desktop", surface);
    },
    [surface],
  );
  const onLine = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.currentTarget.href = withDistinctId(LINE_MINI_APP_HREF);
      logLaunchAppClick("line_mobile", surface);
      sendLineTagConversion();
    },
    [surface],
  );

  return (
    <>
      <a
        href={WEB_APP_HREF}
        {...external}
        onClick={onWeb}
        className={`${className} hidden md:inline-flex`}
      >
        {children}
      </a>
      <a
        href={LINE_MINI_APP_HREF}
        {...external}
        onClick={onLine}
        className={`${className} inline-flex md:hidden`}
      >
        {children}
      </a>
    </>
  );
}
