import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { datasetBackedPaths } from './src/data/datasetRoutes.ts';
import { goneRoutes } from './src/data/gone.ts';
import { routeDefinitions } from './src/data/routes.ts';

/*
 * A dataset page takes its path over from the route table via `getStaticPaths`, so
 * where the two disagree the dataset page is the one that renders and the route
 * entry describes a page nobody serves. Its `noindex` must not keep the live page
 * out of the sitemap.
 */
const datasetOwned = new Set(datasetBackedPaths());

/**
 * The sitemap integration enumerates every route the build emits, including the
 * server-rendered ones. `goneRoutes` has to be listed explicitly: those paths return
 * 410 and carry no `RouteDefinition`, so the `noindex` filter below cannot see them.
 * Without this, the sitemap would advertise 15 URLs that answer 410 — 15 Search
 * Console errors on day one, on a brand-new property.
 */
const excludedFromSitemap = new Set([
  '/internal/',
  ...goneRoutes,
  ...routeDefinitions
    .filter((route) => route.noindex && !datasetOwned.has(route.path))
    .map((route) => route.path),
]);

/*
 * ---------------------------------------------------------------------------
 * The route manifest (docs/adr/0005-the-free-plan-is-the-design-target.md)
 * ---------------------------------------------------------------------------
 *
 * `dist/_routes.json` decides, for every request, whether Cloudflare Pages serves an
 * unmetered static asset or invokes the metered Function. It is the largest
 * free-plan lever on the site and nothing else in the build reads it.
 *
 * The adapter derives it the other way round: `include: ["/*"]` plus one *exclude*
 * rule per prerendered page. Cloudflare caps the file at 100 rules counting include
 * and exclude together, so that shape scales with the page count and dies at it —
 * when the list will not fit, the adapter keeps `include: ["/*"]` and truncates the
 * excludes to whatever is left
 * (node_modules/@astrojs/cloudflare/dist/utils/generate-routes-json.js:203-212).
 * The site outgrew the cap, and 129 of 130 pages moved onto the Function with no
 * setting changed and no warning printed.
 *
 * So this integration writes the file itself, from the inverse and much smaller
 * list: the routes the build reports as NOT prerendered. That list is the two API
 * endpoints and fifteen individual removed paths, and it does not grow with the page
 * inventory — so `exclude` is empty and a page is a static asset by default rather
 * than by rule.
 *
 * The four WordPress archive catch-alls that used to sit here were retired to the
 * static 404: they were the only unbounded metered surface on the site. See
 * `retiredArchivePrefixes` in src/data/gone.ts.
 *
 * The adapter skips its own generation when `_routes.json` already exists, and in
 * any case runs first: the adapter is unshifted ahead of `integrations`
 * (astro/dist/integrations/hooks.js, `runHookBuildDone`). This hook therefore has
 * the last word on the file.
 *
 * The route data comes from `astro:routes:resolved`, whose `IntegrationResolvedRoute`
 * carries `isPrerendered`, `pattern` and `type` in the installed Astro — 5.18.2,
 * astro/dist/types/public/integrations.d.ts:255-276. (`astro:build:done` also
 * carries routes, but that field is deprecated there in favour of this hook.) The
 * shape is checked at runtime rather than assumed: if a later version stops
 * reporting the prerender flag, the same list is derived by scanning `src/pages` for
 * `export const prerender = false`, and the build line says which source it used.
 */
const ROUTE_RULE_CAP = 100;

/*
 * The build fails above this rather than at the cap, because the cap is where
 * Cloudflare stops reading and the adapter starts truncating. Ten rules of headroom
 * turns that cliff into a failed build instead of a silently metered site.
 */
const ROUTE_RULE_BUDGET = 90;

const PAGE_EXTENSIONS = ['.astro', '.ts', '.js', '.mjs', '.md', '.mdx'];
const ON_DEMAND_MARKER = /export\s+const\s+prerender\s*=\s*false/;

/**
 * An Astro route pattern (`/category/[...slug]`, `/api/code-report.json`) becomes the
 * pattern Cloudflare matches a request path against.
 *
 * A dynamic segment ends the pattern in `*`, because Cloudflare honours a wildcard
 * only as a suffix. A dynamic segment mid-path therefore widens the rule to
 * everything below it, which is deliberately over-inclusive: a prerendered page swept
 * onto the Function by too wide a rule is caught by `pnpm check:routes`, an on-demand
 * route missed by too narrow a rule is a 404 nobody sees until a reader hits it.
 *
 * A page route keeps its trailing slash under `trailingSlash: 'always'`, because that
 * is the form the request arrives in and Astro reports page routes without it. An
 * endpoint is emitted exactly as the route table reports it — `/api/code-report.json`
 * has no slash, Astro's injected `/_image/` has one — because an endpoint's route
 * string is the URL it answers on.
 *
 * Astro's own internal routes (`/_image/`, `/_server-islands/[name]`) are on-demand
 * and are kept. They cost two rules, no built page lives under either prefix, and
 * dropping them would make a server island 404 with nothing to say why.
 */
const cloudflarePatternForRoute = (route, trailingSlash) => {
  const segments = route.pattern.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments.length === 0) return '/';

  const emitted = [];
  for (const segment of segments) {
    if (segment.startsWith('[')) {
      emitted.push('*');
      return `/${emitted.join('/')}`;
    }
    emitted.push(segment);
  }

  const pathname = `/${emitted.join('/')}`;
  if (route.type === 'page' && trailingSlash === 'always') return `${pathname}/`;
  return route.pattern.length > 1 && route.pattern.endsWith('/') ? `${pathname}/` : pathname;
};

/**
 * The documented fallback source, used only when the build's route data does not
 * carry a prerender flag. It reads the same declaration the flag is derived from, so
 * the two agree by construction.
 */
const scanPagesForOnDemandRoutes = (pagesDir) => {
  const root = fileURLToPath(pagesDir);
  const routes = [];

  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (!PAGE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) continue;
      if (!ON_DEMAND_MARKER.test(readFileSync(path, 'utf8'))) continue;

      const routePath = relative(root, path)
        .split(sep)
        .join('/')
        .replace(/\.(?:astro|ts|js|mjs|md|mdx)$/, '')
        .replace(/(?:^|\/)index$/, '');
      const pattern = `/${routePath}`.replace(/\/+$/, '') || '/';
      const lastSegment = pattern.split('/').pop() ?? '';
      routes.push({ pattern, type: lastSegment.includes('.') ? 'endpoint' : 'page' });
    }
  };

  walk(root);
  return routes;
};

const exposesPrerenderFlag = (routes) =>
  Array.isArray(routes)
  && routes.length > 0
  && routes.every(
    (route) => typeof route?.isPrerendered === 'boolean' && typeof route?.pattern === 'string',
  );

const writeIfChanged = (target, contents) => {
  let current = null;
  try {
    current = readFileSync(target, 'utf8');
  } catch {
    current = null;
  }
  if (current === contents) return false;
  writeFileSync(target, contents, 'utf8');
  return true;
};

/**
 * `<lastmod>`, read back from the page the build actually wrote.
 *
 * The sitemap advertised 104 URLs and no `<lastmod>` at all, on a site whose whole
 * proposition is that it records when each claim was checked. The data was already
 * there: 54 pages emit a `dateModified` in their graph.
 *
 * ## Why it reads the built page rather than recomputing the date
 *
 * Three templates derive that date three different ways — `RouteScreen` from the
 * operational record's `latestCheckedAt`, `DatasetArticle` from the dataset's own
 * row dates, `EditorialArticle` from the article's typed review field, which Step 1b
 * retires. Recomputing here would be a fourth derivation of the same fact, in a file
 * that cannot even reach `astro:content` (see src/data/datasetRoutes.ts), and it
 * would drift the first time one of the three changed.
 *
 * This project has already paid for that mistake once: `/daily/monopoly-go/` shipped
 * indexable and absent from the sitemap because the page and a stale route entry
 * disagreed and the sitemap believed the entry. The page that actually renders is
 * the one whose judgement counts. Reading the emitted graph makes the two agree by
 * construction, and means Step 1b needs no change here.
 *
 * A page with no recorded check emits no `dateModified`, so it gets no `<lastmod>`,
 * which is the standing rule holding rather than a gap: the build clock never dates
 * a page (CLAUDE.md; docs/adr/0003-no-hand-typed-verification-claims.md).
 */
const recordedLastmod = () => {
  let outDir = null;
  const cache = new Map();

  const readFor = (pageUrl) => {
    const { pathname } = new URL(pageUrl);
    if (cache.has(pathname)) return cache.get(pathname);

    let latest;
    try {
      const html = readFileSync(join(fileURLToPath(outDir), pathname, 'index.html'), 'utf8');
      /*
       * One graph per page is a standing rule that `pnpm check:routes` enforces, so
       * the first block is the only block; a page that somehow has none simply
       * carries no date.
       */
      const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (block) {
        const graph = JSON.parse(block[1]);
        const nodes = Array.isArray(graph['@graph']) ? graph['@graph'] : [graph];
        /*
         * Newest wins. Exactly one node carries the date today; taking the maximum
         * means a page that later dates both its WebPage and its Article cannot
         * advertise the older of the two.
         */
        for (const node of nodes) {
          const value = node && typeof node.dateModified === 'string' ? node.dateModified : null;
          if (!value || Number.isNaN(Date.parse(value))) continue;
          if (!latest || Date.parse(value) > Date.parse(latest)) latest = value;
        }
      }
    } catch {
      latest = undefined;
    }

    cache.set(pathname, latest);
    return latest;
  };

  return {
    integration: {
      name: 'freetins:sitemap-lastmod',
      hooks: {
        'astro:config:done': ({ config }) => {
          outDir = config.outDir;
        },
      },
    },
    /** Astro's sitemap omits the element entirely when `lastmod` is absent. */
    serialize: (item) => {
      const at = outDir ? readFor(item.url) : undefined;
      return at ? { ...item, lastmod: at } : item;
    },
  };
};

const sitemapLastmod = recordedLastmod();

const freePlanRouteManifest = () => {
  let resolvedRoutes = null;
  let astroConfig = null;

  return {
    name: 'freetins:route-manifest',
    hooks: {
      'astro:routes:resolved': ({ routes }) => {
        resolvedRoutes = routes;
      },
      'astro:config:done': ({ config }) => {
        astroConfig = config;
      },
      'astro:build:done': ({ dir, logger }) => {
        const trailingSlash = astroConfig?.trailingSlash ?? 'ignore';

        /*
         * `FREETINS_ROUTE_SOURCE=scan` forces the fallback, so it can be run and
         * its output compared against the build's own route data rather than
         * sitting unexercised until the day it is the only source left. The two
         * agree on all 20 project routes; the scan cannot see the routes Astro
         * injects, which is why taking it warns.
         */
        const forceScan = process.env.FREETINS_ROUTE_SOURCE === 'scan';

        let source = 'astro:routes:resolved';
        let onDemandRoutes;
        if (!forceScan && exposesPrerenderFlag(resolvedRoutes)) {
          onDemandRoutes = resolvedRoutes.filter(
            (route) => !route.isPrerendered && (route.type === 'page' || route.type === 'endpoint'),
          );
        } else {
          source = `a scan of src/pages for \`export const prerender = false\`${forceScan ? ' (forced)' : ''}`;
          onDemandRoutes = scanPagesForOnDemandRoutes(new URL('./pages/', astroConfig.srcDir));
          logger.warn(
            'Deriving the route manifest by scanning src/pages. That reads the project\'s own routes only: the routes Astro injects (/_image/, /_server-islands/[name]) are not files under src/pages and will be absent from dist/_routes.json. Harmless while imageService is "compile" and no server island is used; check both before relying on it.',
          );
        }

        if (process.env.FREETINS_ROUTE_DEBUG) {
          logger.info(
            `on-demand routes: ${JSON.stringify(
              onDemandRoutes.map((route) => ({
                pattern: route.pattern,
                type: route.type,
                origin: route.origin,
              })),
            )}`,
          );
        }

        const patterns = onDemandRoutes.map((route) =>
          cloudflarePatternForRoute(route, trailingSlash),
        );

        /*
         * `/api/*` in place of one rule per endpoint. Nothing under that prefix is
         * ever prerendered, so the wildcard cannot sweep a static page onto the
         * Function, and the rule count stops tracking the endpoint count.
         */
        const include = [
          ...new Set(patterns.map((pattern) => (pattern.startsWith('/api/') ? '/api/*' : pattern))),
        ].sort();

        if (include.length === 0) {
          throw new Error(
            'The route manifest derived no on-demand routes. An empty include list would serve /api/checker-status.json and /api/code-report.json from static assets, where both answer 404 instead of running, so nothing would report the failure. Refusing to write dist/_routes.json.',
          );
        }
        if (include.length > ROUTE_RULE_BUDGET) {
          throw new Error(
            `The route manifest needs ${include.length} include rules, over the ${ROUTE_RULE_BUDGET} this build allows of Cloudflare's ${ROUTE_RULE_CAP}. Past the cap Cloudflare stops reading the file and every page is served by the metered Function. Collapse on-demand routes under a shared prefix before adding more.`,
          );
        }

        writeFileSync(
          new URL('./_routes.json', dir),
          `${JSON.stringify({ version: 1, include, exclude: [] }, null, 2)}\n`,
          'utf8',
        );

        /*
         * The same derivation, written back to the repository so the rendering
         * contract is a build artefact rather than a hand-kept list that can drift
         * from the routes it describes (docs/adr/0003: derived from the build
         * manifest). `pnpm check:routes` reads it and checks both directions against
         * dist/_routes.json.
         */
        const concretePaths = [...new Set(patterns.filter((pattern) => !pattern.includes('*')))].sort();
        const prefixes = [
          ...new Set(
            patterns
              .filter((pattern) => pattern.endsWith('/*'))
              .map((pattern) => pattern.slice(0, -1)),
          ),
        ].sort();

        const renderingContract = {
          $comment:
            'Generated on every build by the freetins:route-manifest integration in astro.config.mjs, from the routes the build reports as not prerendered. Do not edit by hand — pnpm build rewrites it, and pnpm check:routes reads it against dist/_routes.json.',
          workerRoutePatterns: include,
          onDemandRoutePaths: concretePaths,
          onDemandRoutePrefixes: prefixes,
        };

        const contractPath = fileURLToPath(
          new URL('./src/data/route-rendering.json', astroConfig.root),
        );
        const rewritten = writeIfChanged(
          contractPath,
          `${JSON.stringify(renderingContract, null, 2)}\n`,
        );

        logger.info(
          `route manifest: ${include.length} include rules and 0 exclude, from ${onDemandRoutes.length} on-demand routes (${source})${
            rewritten ? '; src/data/route-rendering.json rewritten' : ''
          }`,
        );
      },
    },
  };
};

export default defineConfig({
  site: 'https://www.freetins.com',
  output: 'static',
  trailingSlash: 'always',
  /*
   * `imageService: 'custom'` is the adapter's only mode that keeps a configured
   * `image.service`: 'compile' overwrites it with the stock sharp service, so the
   * per-format quality in src/lib/image-service.ts would be silently discarded.
   * The transform underneath is still sharp at build time, which is what 'compile'
   * bought — the site is `output: 'static'`, every page is prerendered and every
   * image is written to disk, so nothing reaches sharp at runtime under either
   * mode. `pnpm check:routes` reads `dist/_routes.json` back and is the guard that
   * this did not turn a page view into a metered request (ADR 0005).
   */
  adapter: cloudflare({ imageService: 'custom' }),
  image: {
    service: { entrypoint: './src/lib/image-service.ts' },
  },
  build: {
    format: 'directory',
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  session: {
    driver: 'null',
  },
  integrations: [
    sitemap({
      /*
       * `goneRoutes` has to be named explicitly in `excludedFromSitemap`: those paths
       * return 410 and carry no `RouteDefinition`, so the `noindex` filter cannot see
       * them. The WordPress archive prefixes need no rule — they have no route at all
       * now, so the integration has nothing to enumerate.
       */
      filter: (page) => !excludedFromSitemap.has(new URL(page).pathname),
      serialize: sitemapLastmod.serialize,
    }),
    sitemapLastmod.integration,
    freePlanRouteManifest(),
  ],
  compressHTML: true,
});
