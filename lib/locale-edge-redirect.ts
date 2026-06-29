import {
  parseLocaleCookie,
  shouldSkipThailandDefaultRedirect,
} from "@/lib/locale-cookie";
import { isLikelyAutomatedUserAgent } from "@/lib/locale-storage";

export type EdgeLocaleRedirectInput = {
  country: string | null | undefined;
  cookieHeader: string | null;
  userAgent: string;
  pathname: string;
};

const ROOT_PATHS = new Set(["/", "/index.html"]);

/** Pure redirect decision for the production geo Worker and unit tests. */
export function resolveEdgeLocaleRedirect(input: EdgeLocaleRedirectInput): string | null {
  const { country, cookieHeader, userAgent, pathname } = input;

  if (!ROOT_PATHS.has(pathname)) return null;
  if (isLikelyAutomatedUserAgent(userAgent)) return null;

  const locale = parseLocaleCookie(cookieHeader);
  if (shouldSkipThailandDefaultRedirect(locale)) return null;

  if (country === "TH") return "/th";

  return null;
}
