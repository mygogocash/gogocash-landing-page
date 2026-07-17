import { resolveEdgeLocaleRedirect } from "../lib/locale-edge-redirect";
import { withProductionHeaders } from "../lib/production-response-headers";

type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cf = (request as Request & { cf?: { country?: string } }).cf;

    if (url.hostname.endsWith(".")) {
      url.hostname = url.hostname.slice(0, -1);
      return withProductionHeaders(
        Response.redirect(url.toString(), 308),
        url.pathname,
      );
    }

    const redirectPath = resolveEdgeLocaleRedirect({
      country: cf?.country ?? null,
      cookieHeader: request.headers.get("Cookie"),
      userAgent: request.headers.get("User-Agent") ?? "",
      pathname: url.pathname,
    });

    if (redirectPath) {
      url.pathname = redirectPath;
      return withProductionHeaders(
        Response.redirect(url.toString(), 302),
        url.pathname,
      );
    }

    const response = await env.ASSETS.fetch(request);
    return withProductionHeaders(response, url.pathname);
  },
};

export default worker;
