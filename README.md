# Freetins

Production Astro 5 port of the 33-screen Freetins prototype, targeting Cloudflare Pages.

## Requirements

- Node.js 20.19.5 (`.nvmrc`)
- pnpm 10.34.5
- A Cloudflare Pages project for production deployment

## Local development

```bash
pnpm install
pnpm dev
```

The production-style local preview builds the site and serves the output through Wrangler:

```bash
pnpm preview
```

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Cloudflare Pages

Connect the repository in Workers & Pages with these settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `20.19.5`

`wrangler.toml` is the source-controlled Pages configuration. D1, KV, and secret bindings will be added when the server routes and hourly checker are implemented.

## Prototype reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project status

The current stage establishes the Astro/Pages foundation, shared product shell, and production Home route. Content collections, remaining routes, D1/KV endpoints, SEO builders, and full visual QA follow in the order defined by the attached handoff brief.
