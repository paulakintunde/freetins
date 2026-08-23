# Freetins

Production Astro 5 port of the 33-screen Freetins prototype, targeting Cloudflare Pages.

## Requirements

- Node.js 24.15.0 (`.nvmrc`)
- pnpm 11.19.0
- A Cloudflare Pages project for production deployment

## Local development

```bash
pnpm install
pnpm dev
```

Open the URL printed by Astro, normally `http://localhost:4321`. Do not open the prototype HTML files directly: `file://` URLs cannot provide production routing.

The production-style local preview builds the site and serves the output through Wrangler:

```bash
pnpm preview
```

## Rendering and navigation

The project is static-first. Astro prerenders catalogue, game, guide, gear, editorial, legal, contact, submission, and alert-signup routes into HTML at build time. The rendering contract in `src/data/route-rendering.json` opts `/search`, `/status`, private alert confirmation/management routes, and RSS feeds into Cloudflare on-demand rendering. The five `/api/*` routes run on demand for writes and live status.

Static routes use Astro's file output with extensionless, no-trailing-slash public URLs. This matches Cloudflare Pages route resolution directly and avoids the redirect hop produced by directory-style `page/index.html` output.

Internal navigation uses Astro's `ClientRouter` with hover/focus prefetching. The browser still receives complete HTML for every route, so direct URLs and JavaScript-disabled navigation continue to work. Shared shell behavior lives in `src/scripts/site.ts`, which uses delegated events and Astro navigation lifecycle events instead of attaching listeners to DOM nodes that are replaced during a route swap.

Hashed files under `/_astro/` and `/assets/` are cached immutably. Cloudflare Pages handles normal static document caching, code pages receive a five-minute edge freshness window, `/status` receives a 30-second edge freshness window, and `/search` plus `/alerts/manage` are private and never cached.

## Functional routes

- `POST /api/contact` validates and stores corrections and enquiries in D1.
- `GET /search?q=...` ranks the generated public route catalogue without a client-side content download.
- `GET /api/status` exposes the current `STATUS` KV snapshot for the sitewide banner.
- `POST /api/submissions` stores candidate codes in the verification queue.
- `POST /api/alerts` creates or replaces a pending weekly-digest signup and queues an SES confirmation email.
- `GET /alerts/confirm?t=...` validates the expiring confirmation link and creates the active subscription.
- `GET /alerts/manage?t=...` and `POST /api/alerts/manage` update, pause, resume, or hard-delete a subscription.
- `GET /feeds/releases.xml` and `GET /feeds/:game.xml` provide Atom feeds for verified aggregated releases.

Public forms are same-origin only, size bounded, honeypot protected, and rate limited in D1 without storing raw IP addresses. Alert-management tokens are random 256-bit values; only their SHA-256 hashes are stored.

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm check:routes
pnpm test
```

## Cloudflare Pages

Connect the repository in Workers & Pages with these settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

`wrangler.toml` is the source-controlled Pages configuration and declares the `DB` D1 database plus `STATUS` KV namespace. Current Wrangler versions can provision resources whose IDs are omitted during deployment. If automatic provisioning is disabled for the account, create the resources first and add their IDs to the binding blocks.

Apply the D1 migration before directing production traffic to the forms:

```bash
wrangler d1 migrations apply freetins-app --remote
```

Set `RATE_LIMIT_SALT` as a Pages secret with at least 32 random bytes. Local development reads it from `.dev.vars`; the checked-in example contains no usable secret.

The `/status` route reads the optional `STATUS` KV binding at the key `checker:current`. Its JSON value must contain `state`, `lastFullRun`, `pagesChecked`, `medianResponseMs`, and `message`. Until the binding is provisioned or when its value is invalid, the page reports status data as unavailable instead of presenting invented operational data.

For local status testing:

```bash
wrangler kv key put "checker:current" --path tests/fixtures/status-degraded.json --binding STATUS --local
```

The alert system uses a Pages Queue producer and a separate SES delivery Worker. Apply `0002_alert_delivery.sql`, configure the shared confirmation secret, provision the two Queues, and deploy `workers/alert-delivery/` before enabling public email signup. The exact production gates and planned Discord/Web Push stages are in `docs/alert-rollout.md`.

## Prototype reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project status

The Astro/Pages foundation remains static-first while contact, search, sitewide status, code submission, alert signup, and alert management are functional. The route crawl verifies that every internal link resolves and that no prototype hash routes leak into the build. SES confirmation delivery is implemented but remains disabled until its Cloudflare and AWS resources are provisioned; weekly digest sending, Discord, and Web Push remain deliberately gated.
