"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { posthogCapturePageView } from "@/lib/posthog-client";

/**
 * Sends analytics pageviews on client-side route changes (App Router).
 * Initial load is captured by `PostHogInit` after cookie consent.
 */
function AnalyticsRouteListenerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);
  const lastFullPath = useRef("");

  useEffect(() => {
    const qs = searchParams.toString();
    const full = qs ? `${pathname}?${qs}` : pathname;

    if (isFirst.current) {
      isFirst.current = false;
      lastFullPath.current = full;
      return;
    }

    if (lastFullPath.current === full) return;
    lastFullPath.current = full;

    const fire = () => {
      posthogCapturePageView(full);
    };
    const schedule =
      typeof requestAnimationFrame !== "undefined"
        ? () => requestAnimationFrame(fire)
        : () => queueMicrotask(fire);
    schedule();
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsRouteListener() {
  return (
    <Suspense fallback={null}>
      <AnalyticsRouteListenerInner />
    </Suspense>
  );
}
