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
- `/how-we-verify/`
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
- Use a verification result of `accepted` for a successful redemption/open/entry, `source-only` for an authoritative announcement that was not redeemed, `rejected` for an expired record, and `unreachable` when the check could not complete.
- Enable checker, alerts, or advertising only after their required schedule, endpoint, channel, provider, privacy URL, and placement records are configured.

Every aggregate shown by the site is derived from this file. `pnpm check:data` rejects duplicate identifiers, prototype domains, typed relative ages, broken references, and unsupported `published` states.

## Cloudflare Pages

Recommended project settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

`wrangler.toml` is the source-controlled Pages configuration. Add the optional `STATUS` KV binding when the checker is provisioned; alert delivery remains inactive until `services.alerts.subscriptionEndpoint` points to a deployed HTTPS intake service.

## Prototype Reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project Status

The current stage is a direct-route launch build with the new information architecture, canonical slugs, and deleted legacy shells. The remaining work is content verification and production rollout, not route migration.
