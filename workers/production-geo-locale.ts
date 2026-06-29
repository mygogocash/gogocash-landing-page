import { resolveEdgeLocaleRedirect } from "../lib/locale-edge-redirect";

type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cf = (request as Request & { cf?: { country?: string } }).cf;

    const redirectPath = resolveEdgeLocaleRedirect({
      country: cf?.country ?? null,
      cookieHeader: request.headers.get("Cookie"),
      userAgent: request.headers.get("User-Agent") ?? "",
      pathname: url.pathname,
    });

    if (redirectPath) {
      url.pathname = redirectPath;
      return Response.redirect(url.toString(), 302);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
