"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  isMarketingAllowed,
} from "@/lib/cookie-consent";

const LINE_TAG_SCRIPT_ID = "line-tag-base";
const LINE_TAG_LOADER_ID = "line-tag-loader";
const LINE_STORAGE_PREFIXES = ["_lt", "__lt__"] as const;
const GOGOCASH_COOKIE_DOMAIN = "gogocash.co";

/** LINE Tag (LAP) base snippet — init + page view. Injected only after consent. */
function lineTagInline(id: string): string {
  return `(function(g,d,o){
  g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
  if (d.getElementById('${LINE_TAG_LOADER_ID}')) return;
  var h='https://d.line-scdn.net';
  var s=d.createElement('script');s.async=1;
  s.id='${LINE_TAG_LOADER_ID}';
  s.src=o||h+'/n/line_tag/public/release/v1/lt.js';
  var t=d.getElementsByTagName('script')[0];t.parentNode.insertBefore(s,t);
})(window, document);
_lt('init', {
  customerType: 'lap',
  tagId: '${id}'
});
_lt('send', 'pv', ['${id}']);`;
}

function accessibleCookieDomains(): string[] {
  const hostname = window.location.hostname.replace(/\.$/, "").toLowerCase();
  const domains = new Set<string>();
  if (hostname) domains.add(hostname);
  if (
    hostname === GOGOCASH_COOKIE_DOMAIN ||
    hostname.endsWith(`.${GOGOCASH_COOKIE_DOMAIN}`)
  ) {
    domains.add(GOGOCASH_COOKIE_DOMAIN);
  }
  return [...domains];
}

/** Clear LINE's accessible first-party cookies/localStorage after withdrawal. */
function clearLineTagStorage(): void {
  try {
    const cookieNames = document.cookie
      .split(";")
      .map((part) => part.slice(0, part.indexOf("=")).trim())
      .filter((name) =>
        LINE_STORAGE_PREFIXES.some((prefix) => name.startsWith(prefix)),
      );
    const expires = "Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=/";
    for (const name of new Set(cookieNames)) {
      document.cookie = `${name}=; ${expires}`;
      for (const domain of accessibleCookieDomains()) {
        document.cookie = `${name}=; ${expires}; Domain=${domain}`;
      }
    }
  } catch {
    /* cookies blocked or unavailable */
  }

  try {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (
        key &&
        LINE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
      ) {
        keys.push(key);
      }
    }
    for (const key of keys) window.localStorage.removeItem(key);
  } catch {
    /* storage blocked or unavailable */
  }
}

function removeLineTag(): void {
  document.getElementById(LINE_TAG_SCRIPT_ID)?.remove();
  document.getElementById(LINE_TAG_LOADER_ID)?.remove();
  const win = window as Window & {
    _lt?: unknown;
    _ltq?: unknown;
    _ltc?: unknown;
  };
  delete win._lt;
  delete win._ltq;
  delete win._ltc;
  clearLineTagStorage();
}

function installLineTag(id: string): void {
  if (document.getElementById(LINE_TAG_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = LINE_TAG_SCRIPT_ID;
  script.text = lineTagInline(id);
  document.head.appendChild(script);
}

/**
 * Cookie-consent gate (#7) for the LINE Tag JS. The script (and its tracking
 * cookies) load only once the visitor enables marketing cookies.
 */
export function LineTagGate({ id }: { id: string }) {
  useEffect(() => {
    const sync = () => {
      if (isMarketingAllowed()) installLineTag(id);
      else removeLineTag();
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, [id]);

  return null;
}
