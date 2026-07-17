import { publicLineTagId, shouldLoadLineTag } from "@/lib/app-config";
import { LineTagGate } from "@/components/line-tag-gate";

/**
 * LINE Tag base (LAP): init + page view. Matches LINE Business Manager snippet;
 * uses first-party-friendly loader from LINE CDN. There is intentionally no
 * `<noscript>` pixel: without JavaScript there is no way to obtain marketing
 * consent before that request fires.
 */
export function LineTagScripts() {
  const id = publicLineTagId();
  if (!shouldLoadLineTag() || !id) return null;

  return <LineTagGate id={id} />;
}
