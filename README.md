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

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm check:routes
```

## Cloudflare Pages

Connect the repository in Workers & Pages with these settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Node.js: `24.15.0`

`wrangler.toml` is the source-controlled Pages configuration. D1, KV, and secret bindings will be added when the server routes and hourly checker are implemented.

## Prototype reference

`Freetins Site.dc.html`, `support.js`, `image-slot.js`, and `_ds/` are source references only. They are not imported by the Astro application and are not copied into `dist`.

## Project status

The current stage establishes the Astro/Pages foundation, shared product shell, production Home route, and generated documents for the complete public route map. The route crawl verifies that every internal link resolves and that no prototype hash routes leak into the build. Content collections, D1/KV endpoints, SEO builders, and full screen-by-screen visual QA follow in the order defined by the attached handoff brief.
