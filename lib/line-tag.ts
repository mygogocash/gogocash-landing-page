import { publicLineTagId, shouldLoadLineTag } from "@/lib/app-config";
import { isMarketingAllowed } from "@/lib/cookie-consent";

type LineTagGlobal = Window & { _lt?: (...args: unknown[]) => void };

/**
 * Standard LINE conversion event — call after LINE Tag base has loaded (e.g. CTA click).
 */
export function sendLineTagConversion(): void {
  if (typeof window === "undefined") return;
  // Recheck at the final send boundary: a loaded or in-flight provider script
  // can outlive the DOM cleanup that follows a consent withdrawal.
  if (!isMarketingAllowed()) return;
  if (!shouldLoadLineTag()) return;
  const id = publicLineTagId();
  if (!id) return;

  const _lt = (window as LineTagGlobal)._lt;
  if (typeof _lt !== "function") return;

  try {
    _lt("send", "cv", { type: "Conversion" }, [id]);
  } catch {
    /* LINE script not ready or blocked */
  }
}
