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

Astro prerenders the site at build time. The app no longer uses the legacy redirect layer or legacy on-demand route gating. The current build is meant to be served as direct HTML with matching canonical URLs.

Shared shell behavior lives in `src/scripts/site.ts`, which uses delegated events and Astro navigation lifecycle events.

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm check:routes
```

## Cloudflare Pages

Recommended project settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

`wrangler.toml` is the source-controlled Pages configuration. Resource identifiers for D1, KV, and secret bindings are added after those Cloudflare resources are provisioned.

## Prototype Reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project Status

The current stage is a direct-route launch build with the new information architecture, canonical slugs, and deleted legacy shells. The remaining work is content verification and production rollout, not route migration.
