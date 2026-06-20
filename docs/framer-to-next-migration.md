# Migrate marketing from Framer → this Next.js site

Production target: **`https://gogocash.co`** on **Cloudflare Workers Static Assets**. The app is a **static export** (`output: "export"` → `out/`).

---

## 1. Inventory Framer (parity checklist)

| Area | Action |
|------|--------|
| **URLs** | Export a list of every path Framer serves (`/`, `/pricing`, etc.). Map each to a route under `app/` or note a **gap** to build. |
| **Copy & layout** | Screenshot or copy text from Framer; compare to Next pages (`app/page.tsx`, `about`, `learn`, locales `en`/`th`/…). |
| **Images / video** | Download originals (not only compressed exports). Place under `public/`; prefer WebP/AVIF where you optimize. |
| **Forms** | Note submit endpoints (Framer form, Zapier, etc.). This export has no app API; use external form services or a separate backend. |
| **Embeds** | Lottie, Cal.com, Typeform, etc.—recreate in React components or `next/script` as needed. |
| **SEO** | Title, description, OG image per page—mirror in `metadata` / `layout.tsx` / page exports. |
| **Analytics** | List Framer snippets (GA, Meta Pixel, etc.). Wire via **env** in this repo (see `.env.example`; PostHog, Cloudflare Web Analytics, and LINE Tag are supported in code). |

**Routes already in this repo (reference):** `/`, `/about`, `/search`, `/learn`, `/learn/[slug]`, `/how-gogocash-makes-money`, `/privacy-policy`, `/term-of-use`, `/terms-of-service`, locale roots `/en`, `/th`, `/id`, `/ja`, `/tw`, `/sitemap.xml`.

---

## 2. Close content & UX gaps in code

1. Implement any **missing pages** or sections compared to Framer.
2. Set production env before **`npm run build`**:
   - `NEXT_PUBLIC_SITE_URL=https://gogocash.co` (read by `lib/app-config.ts` / `app/layout.tsx`; not listed in `.env.example` — set it in CI secrets or `.env.production.local`)
   - PostHog, Cloudflare Web Analytics, and LINE Tag analytics keys as needed (see `.env.example`).
3. Run **`npm run verify`** locally; fix lint/tests/build.
4. Optional: **`npm run test:e2e`** for critical flows.

---

## 3. Staging on Cloudflare (smoke test)

1. Build: **`npm run build`** → confirm **`out/index.html`** exists.
2. Deploy: **`npm run deploy:cloudflare:staging`** (runs `next build`, then `wrangler deploy --config wrangler.staging.jsonc`). See [`cloudflare-workers-deploy.md`](./cloudflare-workers-deploy.md).
3. Test the deployed site at **`https://staging.gogocash.co`**.

---

## 4. Custom domain `gogocash.co` on Cloudflare Workers

1. Configure the Worker custom domains in `wrangler.production.jsonc`.
2. Deploy with `npm run deploy:cloudflare:production`.
3. Confirm Cloudflare DNS and SSL are active for `gogocash.co`.

**Redirects (www ↔ apex):** Prefer **one** canonical host. Options:

- **Cloudflare** Redirect Rule or Bulk Redirect, e.g. `www` → `https://gogocash.co`.

Static export does **not** run a Node server. Workers Static Assets `_redirects` is path-only, so host-level redirects belong in Cloudflare Redirect Rules.

---

## 5. Cutover plan (low downtime)

1. **Lower TTL** on relevant DNS records at Cloudflare a day ahead (optional).
2. Final **`npm run build`** with production `NEXT_PUBLIC_*`.
3. **`npm run deploy:cloudflare:production`** or the production CI workflow.
4. **Switch DNS/custom domains** to Cloudflare Workers; wait for **SSL active** on custom domain.
5. **Test:** homepage, locales, search, learn, legal pages, mobile, CTAs (App Store / LINE / etc.).

---

## 6. Post-cutover

| Task | Notes |
|------|--------|
| **Google Search Console** | Add property for `https://gogocash.co`, verify, submit `sitemap.xml`. |
| **Update links** | App deep links, emails, ads, social bios → `https://gogocash.co`. |
| **Framer** | Cancel or downgrade after TTL flush; keep a **PDF/export** of old copy for reference. |

---

## 7. Risk summary

| Risk | Mitigation |
|------|------------|
| **URL changes** | Cloudflare **bulk redirects** from old Framer paths to new Next paths. |
| **Forms on Framer** | Plan external handler or small API elsewhere before removing Framer. |
| **Analytics gaps** | Compare event names in GA / your analytics tools before and after; document renames. |
| **Host redirects** | Use Cloudflare Redirect Rules; Workers `_redirects` cannot match hostnames. |

---

## Related docs

- [`docs/cloudflare-workers-deploy.md`](./cloudflare-workers-deploy.md) — build and deploy to Cloudflare Workers Static Assets
