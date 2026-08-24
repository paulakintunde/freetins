# Freetins

Static-first Astro 5 site for Cloudflare Pages.

## Requirements

- Node.js 24.15.0 (`.nvmrc`)
- pnpm 11.19.0
- A Cloudflare Pages project for deployment

## Local Development

```bash
pnpm install
pnpm dev
```

Open the URL printed by Astro, usually `http://localhost:4321`.

Preview the production build locally with Wrangler:

```bash
pnpm preview
```

## Route Model

The current build uses direct, slash-canonical routes and does not rely on redirect middleware or route gating.

Live public namespaces:

- `/`
- `/codes/`
- `/daily/`
- `/cheats/`
- `/answers/`
- `/guides/`
- `/games/`
- `/gear/`
- `/submit/`
- `/alerts/`
- `/contact/`
- `/blog/`
- `/privacy/`
- `/disclosure/`
- `/terms-and-conditions/`
- `/author/paul-a/`

Earned child routes live under the game namespace:

- `/codes/<slug>/`
- `/codes/<slug>/values/`
- `/codes/<slug>/expired/`
- `/codes/<slug>/updates/`

## Rendering

Astro prerenders every content route as direct HTML with a matching canonical URL. The only on-demand route is `/api/checker-status.json`, a noindex JSON endpoint used when the optional checker service is enabled.

Shared shell behavior lives in `src/scripts/site.ts`, which uses delegated events and Astro navigation lifecycle events.

## Editorial ownership

Bylines are resolved from the article's section in `src/data/authors.ts`, not stored per article, so a page cannot ship crediting the wrong desk.

| Section | Owner |
|---|---|
| Guides | David Ng |
| Answers | Lade Akintunde |
| Cheats | Rohene Ladner |
| Codes, Daily, Resources, legal | Paul A |

## Validation

`pnpm check:data` additionally enforces the citation standard above. `scripts/content-audit.mjs` measures the built output (word counts, schema coverage, internal link graph, duplication) and is how the figures in `CONTENT-AUDIT-2026-08-24.md` were produced:

```bash
pnpm build
node scripts/content-audit.mjs audit-pages.json
```

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm check:data
pnpm build
pnpm check:routes
```

## Operational Content

`src/content/operations.json` is the source of truth for code pages, daily links, generic cheat sheets, value rows, update timelines, products, sponsorships, and service activation.

- Keep a game in `planned` while preparing records. Its configured routes remain available but are `noindex` and show a pending state.
- Change a game or cheat sheet to `published` only after its source URLs, instructions, entries, and verification events are present.
- Store timestamps as UTC ISO strings such as `2026-08-24T09:42:00Z`. Never upload display text such as `3 min ago`.
- Use a verification result of `accepted` for a successful redemption/open/entry, `source-only` for a publisher-channel announcement that was not redeemed, `rejected` for an expired record, and `unreachable` when the check could not complete.

### Citation standard

Evidence must come from a channel the publisher controls.

- `publisherChannels` on a game lists the publisher's own website, YouTube, Discord, Twitch or X accounts. A code citation must sit on one of these hosts, and `check:data` rejects one that does not.
- `publisherSourceUrl` on an entry is the announcement post. It is the only URL shown to readers as evidence.
- `discoveredVia` records where the code was first noticed. Aggregator blogs belong here. It is kept for the audit trail and never rendered as evidence.
- A game or store listing (`officialSourceUrl`) links the game. It is never a code citation: it proves the game exists, not that a code was issued.
- Preview hosts (`*.pages.dev`, `*.vercel.app`, `*.netlify.app`, `*.workers.dev`, `*.github.io`) are rejected anywhere in the evidence chain.
- An entry with no `publisherSourceUrl` is community-reported. It can still be published and can still be redeemed-verified, but it never claims publisher confirmation.

### Evidence states and counts

- `verified` — redeemed in game, inside the freshness window.
- `source-reported` — publisher post confirms it, not redeemed, inside the window.
- `stale` — passed once, now older than the game's `verificationWindowHours`.
- `expired` — re-checked and rejected. Kept on the game page as a retired record.
- `unverified` — no check recorded.

A code is **usable** when its state is `verified` or `source-reported`. A game has an **active record** when at least one entry is usable. Only games with an active record are promoted anywhere on the site.
- Enable checker, alerts, or advertising only after their required schedule, endpoint, channel, provider, privacy URL, and placement records are configured.

Every aggregate shown by the site is derived from this file. `pnpm check:data` rejects duplicate identifiers, prototype domains, typed relative ages, broken references, and unsupported `published` states.

## Cloudflare Pages

Recommended project settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

### Reader reports

Code rows carry a thumbs up/down. Reports are counted and shown but **never** change a
published state: only an editor check does that. Their purpose is to reorder the
re-check queue.

Requires two bindings, and the endpoint refuses reports without them rather than
storing something reversible:

- `REPORTS` — KV namespace for counts and dedup fingerprints.
- `REPORT_SECRET` — secret used to make the per-address fingerprint one-way.

No IP address is ever written to storage. The dedup key is `HMAC(secret, day + entryId + address)`,
truncated, with a 7-day TTL.

### Legacy redirects

`public/_redirects` maps 18 legacy URLs onto the 12 protected pages in
`CONTENT-ALIGNMENT-PLAN.md`. Deleting a legacy *shell* is a route-architecture rule;
404ing an *inbound link that already has traffic* is not the same thing, and these
paths carry roughly 249 monthly visits.

`wrangler.toml` is the source-controlled Pages configuration. Add the optional `STATUS` KV binding when the checker is provisioned; alert delivery remains inactive until `services.alerts.subscriptionEndpoint` points to a deployed HTTPS intake service.

## Prototype Reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project Status

The current stage is a direct-route launch build with the new information architecture, canonical slugs, and deleted legacy shells. The remaining work is content verification and production rollout, not route migration.
