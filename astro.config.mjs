import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
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
 * The seven sections that have a hub page, and the child prefix each hub indexes.
 *
 * Two things read this: the `<lastmod>` derivation below, which dates a hub from the
 * newest page beneath it, and `sitemapChunks`, which gives each section its own
 * sitemap file. Adding a section here is therefore the whole change — it gets a hub
 * date and a sitemap of its own without either being named a second time.
 */
const SECTION_HUBS = ['/codes/', '/cheats/', '/answers/', '/guides/', '/daily/', '/blog/', '/gear/'];

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

  const readFor = (pageUrl) => readForPath(new URL(pageUrl).pathname);

  const readForPath = (pathname) => {
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

  /*
   * A hub's own date, taken from the newest page it lists.
   *
   * Hubs and author pages carry no `dateModified` of their own and so got no
   * `<lastmod>`, which left the seven section indexes and the four author profiles
   * undated - the pages a crawler most benefits from being told about, because they
   * change whenever anything beneath them does.
   *
   * This invents nothing. A listing changed when one of the things it lists changed,
   * so the newest child's recorded date is the hub's date as a matter of fact, not
   * of derivation. A hub whose children all lack a date still gets none.
   *
   * Author pages are the same shape with a different relation - the newest article
   * they byline - but the byline is not recoverable from a path, so they are matched
   * by reading each built page for the author's id. That is one directory scan at
   * build time, cached like everything else here.
   */
  const newestUnder = (predicate) => {
    let latest;
    for (const pathname of allPagePaths()) {
      if (!predicate(pathname)) continue;
      const at = readForPath(pathname);
      if (!at) continue;
      if (!latest || Date.parse(at) > Date.parse(latest)) latest = at;
    }
    return latest;
  };

  let pagePaths = null;
  const allPagePaths = () => {
    if (pagePaths) return pagePaths;
    const root = fileURLToPath(outDir);
    const found = [];
    const walk = (dir, prefix) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('_') || entry.name === 'og') continue;
        const next = join(dir, entry.name);
        const route = `${prefix}${entry.name}/`;
        if (existsSync(join(next, 'index.html'))) found.push(route);
        walk(next, route);
      }
    };
    walk(root, '/');
    pagePaths = found;
    return pagePaths;
  };

  const derivedFor = (pathname) => {
    if (pathname === '/') {
      // The homepage lists the whole catalogue, so its date is the newest anywhere.
      return newestUnder((p) => p !== '/');
    }
    if (SECTION_HUBS.includes(pathname)) {
      return newestUnder((p) => p.startsWith(pathname) && p !== pathname);
    }
    if (pathname === '/games/') {
      return newestUnder((p) => p.startsWith('/codes/') && p !== '/codes/');
    }
    if (pathname.startsWith('/author/')) {
      const id = pathname.slice('/author/'.length, -1);
      return newestUnder((p) => {
        if (p.startsWith('/author/')) return false;
        try {
          const html = readFileSync(join(fileURLToPath(outDir), p, 'index.html'), 'utf8');
          return html.includes(`/author/${id}/#person`);
        } catch {
          return false;
        }
      });
    }
    return undefined;
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
      if (!outDir) return item;
      /*
       * The page's own recorded date first. A hub has none of its own, so it falls
       * back to the newest date among the pages it lists - which is a fact about the
       * listing, not a second derivation of anybody's check.
       */
      const at = readFor(item.url) ?? derivedFor(new URL(item.url).pathname);
      return at ? { ...item, lastmod: at } : item;
    },
  };
};

const sitemapLastmod = recordedLastmod();

/**
 * One sitemap file per section, in place of one file holding every URL.
 *
 * Search Console reports submitted-against-indexed per sitemap file, never per
 * directory. One file therefore answers `128 submitted, 119 indexed` and stops
 * there: the nine that did not make it are unattributable, and the number leads
 * nowhere. Split, the same report names the section that is losing pages, which is
 * the only shape of that number worth having on a site whose open question is which
 * sections get indexed.
 *
 * The prefixes are `SECTION_HUBS` plus `/author/`, which has profiles but no hub.
 * Anything matching no prefix — the homepage, the policy pages, `/games/` — falls to
 * the integration's own leftover chunk, which it names `pages`.
 *
 * The prefixes must stay mutually exclusive. The integration runs every chunk's
 * callback over every URL and concatenates the results, so a URL matching two
 * prefixes would be advertised in two files rather than assigned to the first.
 * Prefix matching on a flat section list gives that for free; nesting a section
 * under another would not.
 *
 * This changes no URL. The index keeps its name and its place in `robots.txt`, so
 * there is nothing to resubmit — Search Console rereads the index and picks the
 * section files up from it.
 */
const sitemapChunks = Object.fromEntries(
  [...SECTION_HUBS, '/author/'].map((prefix) => [
    prefix.replaceAll('/', ''),
    (item) => (new URL(item.url).pathname.startsWith(prefix) ? item : undefined),
  ]),
);

/**
 * `rel` on every external link markdown renders.
 *
 * 72 outbound anchors under `/daily/` carried no `rel` at all. They are the reward
 * and claim links — `static.moonactive.net/.../reward2.html`, `rewards.dicedreams.com`
 * — plus the store, social and Discord links beside them, and they reach the page as
 * markdown: the dataset loader interpolates its rows into the body before it is
 * rendered (src/components/pages/DatasetArticle.astro), and markdown link syntax
 * cannot carry an attribute. So no amount of editing the data would have fixed it.
 *
 * The same class of link in `RouteScreen`'s reward table has been `nofollow noopener`
 * since it was written, so the daily prose is given the same treatment rather than a
 * second policy for the same destination. A reward endpoint rotates, a Discord invite
 * is not an editorial endorsement, and neither is a store listing.
 *
 * Which links those are is read from the data rather than guessed. Nofollowing every
 * external markdown link was tried first and it reached 44 links in `/blog/` and
 * `/guides/` that are first-party documentation — Roblox's own help pages, Xbox,
 * PlayStation and Nintendo support, Wikipedia. Those are the evidence, on a site
 * whose argument is that it shows its evidence, so they stay followed. Matching on
 * the source file does not work either: the dataset loader renders this markdown
 * itself, and the vfile it passes carries no path.
 *
 * So the set below is every URL that appears in a `src/data/daily/*.json` row. That
 * is the definition of a reward link on this site rather than a proxy for it, and it
 * maintains itself: a new drop is nofollowed because it is in the data, and a host
 * that stops being a reward endpoint stops matching when its rows go.
 *
 * Formal `officialSources` citations normally remain followed evidence. Dice Dreams
 * is the one page with an explicit all-external-links policy, so its source URLs join
 * the reward URL set here. The Sources directory declares its own `rel` in
 * `DatasetArticle.astro`; this set covers the duplicate links interpolated into its
 * Markdown tables.
 */
const dailyNofollowUrls = () => {
  const urls = new Set();
  let files;
  try {
    files = readdirSync(join(process.cwd(), 'src', 'data', 'daily'));
  } catch {
    return urls;
  }

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const dataset = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'daily', file), 'utf8'));
    for (const row of dataset.rows ?? []) {
      for (const cell of Object.values(row.cells ?? {})) {
        for (const match of String(cell).matchAll(/https?:\/\/[^\s)\]]+/g)) urls.add(match[0]);
      }
    }

    if (file === 'dice-dreams.json') {
      for (const source of dataset.official_sources ?? []) {
        if (typeof source.url === 'string') urls.add(source.url);
      }
    }
  }

  return urls;
};

const externalLinkRel = () => {
  const nofollowUrls = dailyNofollowUrls();

  return (tree) => {
    const visit = (node) => {
      if (node.tagName === 'a' && node.properties && !node.properties.rel) {
        const href = node.properties.href;
        if (typeof href === 'string' && /^https?:\/\//i.test(href)) {
          let external = false;
          try {
            external = new URL(href).origin !== 'https://www.freetins.com';
          } catch {
            external = false;
          }
          if (external) {
            node.properties.rel = nofollowUrls.has(href) ? ['nofollow', 'noopener'] : ['noopener'];
          }
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
};

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
  markdown: {
    rehypePlugins: [externalLinkRel],
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
      chunks: sitemapChunks,
      /*
       * The stylesheet is a browser-only affordance: it turns each file into a
       * readable table for whoever opens one, and a crawler never runs it. It is
       * referenced from the index and from every section file, so it must stay at
       * this path — `public/main-sitemap.xsl`, with the content type pinned in
       * `public/_headers` because the site sends `X-Content-Type-Options: nosniff`
       * and a stylesheet served as anything but XSL is dropped without a word.
       */
      xslURL: '/main-sitemap.xsl',
    }),
    sitemapLastmod.integration,
    freePlanRouteManifest(),
  ],
  compressHTML: true,
});
