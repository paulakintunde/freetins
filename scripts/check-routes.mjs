import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { goneRoutes } from '../src/data/gone.ts';
import { TITLE_BUDGET } from '../src/lib/pageTitle.ts';

const outputRoot = resolve('dist');
const renderingContractPath = resolve('src/data/route-rendering.json');

if (!existsSync(outputRoot)) {
  throw new Error('dist is missing. Run pnpm build before pnpm check:routes.');
}

const htmlFiles = [];
/*
 * Every other emitted file: images, the search index, the sitemaps, robots.txt.
 * The free-plan guard has to see these too. A page and an asset are metered the
 * same way, so an include rule that swept /og/* onto the Function would cost 99
 * image requests per view while the page count stayed at "all static" and the
 * guard reported nothing wrong.
 */
const assetFiles = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      // _worker.js is the Function itself; it is never served as an asset.
      if (entry.name !== '_worker.js') walk(path);
    } else if (entry.name.endsWith('.html')) htmlFiles.push(path);
    else if (entry.name !== '_routes.json') assetFiles.push(path);
  }
};

walk(outputRoot);

const renderingContract = JSON.parse(readFileSync(renderingContractPath, 'utf8'));
const workerManifestPath = join(outputRoot, '_routes.json');
const workerManifest = existsSync(workerManifestPath)
  ? JSON.parse(readFileSync(workerManifestPath, 'utf8'))
  : { include: [], exclude: [] };

const missing = new Map();
const prototypeLeaks = [];
const noindexSitemapLeaks = [];
const sitemapGaps = [];
const headingOrderLeaks = [];
const titlesTooLong = [];
const titlesMissing = [];
/*
 * Structured data, read back as a graph.
 *
 * A page's JSON-LD is one graph whose nodes are resolved by `@id`. Two nodes
 * under one id are one node with two values for the same property, which a
 * strict merge cannot resolve and will either arbitrate or drop. That is not a
 * shape any template can see on its own: BaseLayout declared `{url}#webpage`
 * named after the document title, three page templates each declared it again
 * in a second script tag named after their own heading, and every one of them
 * was correct in isolation. Thirty-two pages shipped that way. So the graphs
 * are assembled here, out of the emitted HTML, where the whole page is visible.
 */
const graphsUnparsed = [];
const graphsSplit = [];
const graphIdCollisions = [];
const graphDanglingRefs = [];
/** Indexable pages only, keyed by title, to find pages competing with each other. */
const titlesByText = new Map();
let internalLinks = 0;
let workerLinks = 0;
const sitemap = readdirSync(outputRoot)
  .filter((name) => /^sitemap-\d+\.xml$/.test(name))
  .map((name) => readFileSync(join(outputRoot, name), 'utf8'))
  .join('\n');

/**
 * The `noindexSitemapLeaks` check below walks emitted HTML, so it can only see
 * prerendered pages. The 410 routes are server-rendered and emit no HTML, which is
 * exactly how 15 of them reached the sitemap unnoticed. Check them against the
 * sitemap text directly instead.
 */
const goneSitemapLeaks = goneRoutes.filter((route) => sitemap.includes(`${route}</loc>`));

const resolvesToDocument = (pathname) => {
  if (pathname === '/') return existsSync(join(outputRoot, 'index.html'));
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
  return existsSync(join(outputRoot, cleanPath, 'index.html')) || existsSync(join(outputRoot, `${cleanPath}.html`));
};

const matchesPattern = (pathname, pattern) => {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`).test(pathname);
};

const resolvesOnWorker = (pathname) =>
  workerManifest.include.some((pattern) => matchesPattern(pathname, pattern))
  && !workerManifest.exclude.some((pattern) => matchesPattern(pathname, pattern));

/*
 * ---------------------------------------------------------------------------
 * The free-plan guard (docs/adr/0005-the-free-plan-is-the-design-target.md)
 * ---------------------------------------------------------------------------
 *
 * Cloudflare Pages invokes the Function for every request that matches an
 * `include` rule and no `exclude` rule, and serves everything else from static
 * assets. Static assets are unmetered; a Function request is not. So whether the
 * site's entire page inventory is free or metered is decided by one generated
 * file that nothing else in CI reads.
 *
 * The failure this guards against is silent and arrives without anyone changing
 * a setting. Cloudflare caps `_routes.json` at 100 rules counting `include` and
 * `exclude` together; the adapter builds one exclude rule per prerendered page
 * and then, when the total will not fit, abandons the per-page manifest for
 * `include: ["/*"]` plus as much of the exclude list as fits. The pages are at
 * the end of that list, so the rule that makes a page free is the first thing
 * dropped. Adding one page moved every page onto the Function, and nothing in
 * the build output said so.
 *
 * The manifest is now derived the other way round, by the `freetins:route-manifest`
 * integration in `astro.config.mjs`: `include` names only the routes the build
 * reports as on-demand and `exclude` is empty, so the rule count tracks the
 * on-demand routes rather than the page inventory. This guard reads the file that
 * shipped rather than trusting that derivation, and reads it in both directions:
 * every built page must be served as a static asset, and every on-demand route
 * must still be matched by an include rule. Both matter. A manifest that misses
 * a page costs money on every view; a manifest that misses `/api/code-report.json`
 * answers 404 where an endpoint should be, and neither failure announces itself.
 * (The WordPress archive prefixes are deliberately absent from the manifest now and
 * answer from the static 404 — see `retiredArchivePrefixes` in src/data/gone.ts.)
 *
 * Hence two numbers on every run, pass or fail: how many built pages are served
 * as static assets out of how many exist, and how many rules are in use out of
 * the cap. The second is upgrade trigger 3 of ADR 0005, taken as a reading by CI
 * rather than remembered by a person. It counts include and exclude together,
 * because that is what Cloudflare counts.
 */
const ROUTE_RULE_CAP = 100;
const ROUTE_RULE_WARNING = 95;

const pathnameForDocument = (file) => {
  const relativePath = relative(outputRoot, file).split(sep).join('/');
  if (relativePath === 'index.html') return '/';
  if (relativePath.endsWith('/index.html')) return `/${relativePath.slice(0, -'index.html'.length)}`;
  return `/${relativePath.slice(0, -'.html'.length)}`;
};

/*
 * Free means the Function is never invoked: either no `include` rule reaches the
 * path — the shape the manifest takes today, where `exclude` is empty and
 * `include` names only the on-demand routes — or an `exclude` rule covers it.
 * Reading both cases keeps the guard honest against a manifest that is free by a
 * different route than the one the site emits today.
 *
 * The path is matched in exactly the form Cloudflare receives it. The site is
 * `trailingSlash: 'always'`, so a page request carries the slash and
 * `pathnameForDocument` produces that same form; an earlier version of this guard
 * accepted either form, which meant a manifest naming the wrong one reported a
 * page free while every view of it was metered.
 *
 * A missing `_routes.json` is not treated as "no Function": a Pages project with a
 * Function and no manifest runs the Function for every request. The manifest
 * agreement check below makes its absence fatal.
 */
/**
 * Astro escapes markup characters in both the <title> and the JSON-LD payload.
 * A title's length is measured as a reader sees it, and a graph has to parse,
 * so both are decoded through here.
 */
const decodeEntities = (text) => text
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const servedAsStaticAsset = (pathname) =>
  !workerManifest.include.some((pattern) => matchesPattern(pathname, pattern))
  || workerManifest.exclude.some((pattern) => matchesPattern(pathname, pattern));

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');

  /*
   * The header, the drawer, the footer and the consent banner render outside
   * <main>, and the drawer and the banner render before it, so a heading in any of
   * them is the document's first heading: the page's own h1 arrives second, and a
   * footer column title shares its level with the content's h2s. Chrome carries no
   * heading elements for that reason and names its regions with aria instead. The
   * rule is invisible in a partial that looks like it is only labelling its own
   * block, so it is read back out of the emitted HTML here.
   */
  const firstHeading = html.match(/<h([1-6])\b/i)?.[1];
  if (firstHeading !== '1') headingOrderLeaks.push({ file, level: firstHeading });

  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1]);
  if (ldBlocks.length > 1) graphsSplit.push({ file, count: ldBlocks.length });
  for (const block of ldBlocks) {
    let document;
    try {
      document = JSON.parse(decodeEntities(block));
    } catch (error) {
      graphsUnparsed.push({ file, reason: error.message });
      continue;
    }
    const nodes = Array.isArray(document['@graph']) ? document['@graph'] : [document];
    const declared = new Set();
    for (const node of nodes) {
      const id = node?.['@id'];
      if (!id) continue;
      if (declared.has(id)) graphIdCollisions.push({ file, id });
      declared.add(id);
    }
    /*
     * A bare { "@id": x } is a reference to a node; anything else is a node.
     * The site-wide Organization and WebSite are declared in every page's
     * graph by BaseLayout, so a reference to either resolves like any other.
     */
    const references = [];
    const walkNode = (value) => {
      if (Array.isArray(value)) { value.forEach(walkNode); return; }
      if (!value || typeof value !== 'object') return;
      const keys = Object.keys(value);
      if (keys.length === 1 && keys[0] === '@id') { references.push(value['@id']); return; }
      for (const key of keys) if (key !== '@id') walkNode(value[key]);
    };
    walkNode(nodes);
    for (const reference of new Set(references)) {
      if (!declared.has(reference)) {
        graphDanglingRefs.push({ file, id: reference });
      }
    }
  }

  /*
   * The anchor list targets the prototype's nav, whose links were exactly `#codes`,
   * `#daily` and so on. It must close on the quote: without the boundary it also
   * matched `#codes-that-are-circulating-falsely`, a real table-of-contents anchor
   * generated from a real heading, and failed the build on legitimate content.
   */
  if (/file:\/\/\/|Freetins%20Site\.dc\.html|href=["']#(?:home|browse|daily|hub|codes|cheats)["']/i.test(html)) {
    prototypeLeaks.push(file);
  }

  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
  const isNoindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

  /*
   * Titles, read back out of the emitted HTML.
   *
   * The grammar in src/lib/pageTitle.ts cannot enforce this on its own: the
   * author, cheat, gear and editorial templates compose their titles inline,
   * and a dataset page's title is a writer's front-matter field. So the budget
   * is held here, where every title the site actually ships passes through one
   * place, whichever template built it.
   *
   * Length is measured after decoding entities. Astro escapes the apostrophe in
   * "Dandy's World", and counting `&#39;` as five characters would fail a title
   * that is well inside the budget as a reader sees it.
   *
   * Duplicates are counted among indexable pages only. Two noindex placeholders
   * sharing a title costs nothing; two indexable pages sharing one are two
   * pages asking Google to pick between them.
   */
  const title = decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();

  if (!title) titlesMissing.push(file);
  else if (title.length > TITLE_BUDGET) titlesTooLong.push({ file, title });

  if (title && !isNoindex) {
    const sharing = titlesByText.get(title) ?? [];
    sharing.push(file);
    titlesByText.set(title, sharing);
  }

  if (isNoindex) {
    if (canonical && sitemap.includes(`<loc>${canonical}</loc>`)) noindexSitemapLeaks.push(canonical);
  } else if (canonical && !sitemap.includes(`<loc>${canonical}</loc>`)) {
    /*
     * The mirror of the check above, and the one that was missing. A page can be
     * open to Google and never advertised to it, which is silent in a way the
     * reverse is not: nothing 404s, nothing is flagged, the page simply waits to be
     * found. `/daily/monopoly-go/` shipped that way because a dataset page took the
     * path over from a route-table entry still marked noindex, and the sitemap
     * filter believed the entry.
     */
    sitemapGaps.push(canonical);
  }

  const links = html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi);
  for (const [, href] of links) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    const url = new URL(href, 'https://freetins.test');
    if (url.origin !== 'https://freetins.test') continue;

    internalLinks += 1;
    if (resolvesToDocument(url.pathname)) continue;
    if (resolvesOnWorker(url.pathname)) {
      workerLinks += 1;
      continue;
    }

    if (!resolvesToDocument(url.pathname)) {
      const sources = missing.get(url.pathname) ?? [];
      sources.push(file);
      missing.set(url.pathname, sources);
    }
  }
}

/*
 * The second direction. `src/data/route-rendering.json` is written by the same
 * build that writes `dist/_routes.json`, from the same list, so it says which
 * routes must reach the Function. A catch-all has no concrete path, so it is
 * probed at a path under its prefix — the shape a reader arrives on.
 */
const ROUTE_PROBE_SEGMENT = 'freetins-route-guard-probe';

const onDemandProbes = [
  ...(renderingContract.onDemandRoutePaths ?? []).map((pathname) => ({ pathname, label: pathname })),
  ...(renderingContract.onDemandRoutePrefixes ?? []).map((prefix) => ({
    pathname: `${prefix}${ROUTE_PROBE_SEGMENT}/`,
    label: `${prefix}* (probed at ${prefix}${ROUTE_PROBE_SEGMENT}/)`,
  })),
];

const invalidOnDemandRoutes = onDemandProbes.filter(
  ({ pathname }) => resolvesToDocument(pathname) || !resolvesOnWorker(pathname),
);

/*
 * The two files are written by one build from one derivation, so they disagree
 * only when `dist/` is stale or `route-rendering.json` was edited by hand. Either
 * makes every reading below describe a manifest that is not the one deployed.
 */
const declaredWorkerPatterns = [...(renderingContract.workerRoutePatterns ?? [])].sort();
const shippedWorkerPatterns = [...workerManifest.include].sort();
const manifestDisagrees =
  declaredWorkerPatterns.length === 0
  || declaredWorkerPatterns.join('\n') !== shippedWorkerPatterns.join('\n');

if (prototypeLeaks.length > 0) {
  console.error('Prototype file/hash routes leaked into:');
  for (const file of prototypeLeaks) console.error(`- ${file}`);
}

if (missing.size > 0) {
  console.error('Unresolved internal routes:');
  for (const [pathname, sources] of missing) {
    console.error(`- ${pathname} (linked from ${sources[0]})`);
  }
}

if (invalidOnDemandRoutes.length > 0) {
  console.error('On-demand routes were not emitted exclusively as Worker routes:');
  for (const { label } of invalidOnDemandRoutes) console.error(`- ${label}`);
  console.error('No include rule in dist/_routes.json reaches them, so Cloudflare answers them from static assets: a 404 where an endpoint or a 410 belongs.');
}

if (manifestDisagrees) {
  console.error("dist/_routes.json's include list is not the one this build derived:");
  if (declaredWorkerPatterns.length === 0) {
    console.error('- src/data/route-rendering.json declares no worker patterns at all.');
  }
  for (const pattern of declaredWorkerPatterns.filter((entry) => !shippedWorkerPatterns.includes(entry))) {
    console.error(`- ${pattern} is declared in src/data/route-rendering.json and missing from dist/_routes.json`);
  }
  for (const pattern of shippedWorkerPatterns.filter((entry) => !declaredWorkerPatterns.includes(entry))) {
    console.error(`- ${pattern} ships in dist/_routes.json and is not declared in src/data/route-rendering.json`);
  }
  console.error('Both files are written by one build from one derivation, so they only disagree when dist is stale or one of them was edited by hand. Run pnpm build against this tree.');
}

if (noindexSitemapLeaks.length > 0) {
  console.error('Noindex routes leaked into the sitemap:');
  for (const canonical of noindexSitemapLeaks) console.error(`- ${canonical}`);
}

if (sitemapGaps.length > 0) {
  console.error('Indexable pages missing from the sitemap:');
  for (const canonical of sitemapGaps) console.error(`- ${canonical}`);
  console.error('Either advertise them in the sitemap or mark them noindex — not neither.');
}

if (headingOrderLeaks.length > 0) {
  console.error('Pages whose first heading is not the page h1:');
  for (const { file: path, level } of headingOrderLeaks.slice(0, 12)) {
    console.error(`- ${path} (${level ? `first heading is an h${level}` : 'no heading at all'})`);
  }
  if (headingOrderLeaks.length > 12) console.error(`- ...and ${headingOrderLeaks.length - 12} more`);
  console.error('A heading in the chrome outranks the content it precedes. Name the chrome region with aria-label or aria-labelledby and style its text with a class instead of a heading level.');
}

const duplicateTitles = [...titlesByText.entries()].filter(([, files]) => files.length > 1);

if (titlesMissing.length > 0) {
  console.error('Pages that emitted no <title> at all:');
  for (const file of titlesMissing.slice(0, 12)) console.error(`- ${file}`);
  if (titlesMissing.length > 12) console.error(`- ...and ${titlesMissing.length - 12} more`);
}

if (titlesTooLong.length > 0) {
  console.error(`Titles over the ${TITLE_BUDGET}-character budget:`);
  for (const { file: path, title } of titlesTooLong.slice(0, 12)) {
    console.error(`- ${path} (${title.length}) ${title}`);
  }
  if (titlesTooLong.length > 12) console.error(`- ...and ${titlesTooLong.length - 12} more`);
  console.error('Google cuts the tail off in the result list, so the characters past the budget are spent on nobody. Compose the title with fitTitle in src/lib/pageTitle.ts, which drops whole parts in a fixed order rather than truncating, or shorten the front-matter title the page was built from.');
}

if (duplicateTitles.length > 0) {
  console.error('Indexable pages sharing a title:');
  for (const [title, files] of duplicateTitles.slice(0, 12)) {
    console.error(`- ${title} (${files.join(', ')})`);
  }
  if (duplicateTitles.length > 12) console.error(`- ...and ${duplicateTitles.length - 12} more`);
  console.error('Two pages with one title are two pages asking Google to choose between them, and it will usually choose neither. Give each the term it is actually for, or merge them.');
}

if (graphsSplit.length > 0) {
  console.error('Pages emitting more than one JSON-LD block:');
  for (const { file: path, count } of graphsSplit.slice(0, 12)) console.error(`- ${path} (${count} blocks)`);
  if (graphsSplit.length > 12) console.error(`- ...and ${graphsSplit.length - 12} more`);
  console.error('One page is one graph. Pass the template\'s nodes to BaseLayout as schemaNodes, and the properties its WebPage node needs as webPage, instead of declaring a second graph (src/lib/pageGraph.ts).');
}

if (graphsUnparsed.length > 0) {
  console.error('Pages whose JSON-LD did not parse:');
  for (const { file: path, reason } of graphsUnparsed.slice(0, 12)) console.error(`- ${path}: ${reason}`);
  if (graphsUnparsed.length > 12) console.error(`- ...and ${graphsUnparsed.length - 12} more`);
}

if (graphIdCollisions.length > 0) {
  console.error('Nodes sharing an @id inside one graph:');
  for (const { file: path, id } of graphIdCollisions.slice(0, 12)) console.error(`- ${path}: ${id}`);
  if (graphIdCollisions.length > 12) console.error(`- ...and ${graphIdCollisions.length - 12} more`);
  console.error('Two nodes under one id are one node with two values for the same property, and a strict merge resolves that by guessing. Merge them into the single node BaseLayout declares.');
}

if (graphDanglingRefs.length > 0) {
  console.error('Graph references pointing at a node the page never declares:');
  for (const { file: path, id } of graphDanglingRefs.slice(0, 12)) console.error(`- ${path}: ${id}`);
  if (graphDanglingRefs.length > 12) console.error(`- ...and ${graphDanglingRefs.length - 12} more`);
  console.error('The id is usually a trailing slash away from the node it means. Derive it with canonicalUrl and webPageId in src/lib/pageGraph.ts rather than composing it from a stored path.');
}

if (goneSitemapLeaks.length > 0) {
  console.error('Removed (410) routes leaked into the sitemap:');
  for (const route of goneSitemapLeaks) console.error(`- ${route}`);
  console.error('Add them to excludedFromSitemap in astro.config.mjs.');
}

const documentPathnames = htmlFiles.map(pathnameForDocument);
const meteredPages = documentPathnames.filter((pathname) => !servedAsStaticAsset(pathname)).sort();
const staticPageCount = documentPathnames.length - meteredPages.length;

// Assets keep their own filename; only a document collapses to its directory.
const assetPathnames = assetFiles.map((file) => `/${relative(outputRoot, file).split(sep).join('/')}`);
const meteredAssets = assetPathnames.filter((pathname) => !servedAsStaticAsset(pathname)).sort();

if (meteredAssets.length > 0) {
  console.error(`${meteredAssets.length} emitted files that are not pages are matched by an include rule in dist/_routes.json, so each is served by the metered Function instead of as an unmetered static asset:`);
  for (const pathname of meteredAssets.slice(0, 12)) console.error(`- ${pathname}`);
  if (meteredAssets.length > 12) console.error(`- ...and ${meteredAssets.length - 12} more`);
  console.error('An include rule is standing in front of static output. Narrow it in the freetins:route-manifest integration in astro.config.mjs.');
}
const includeRuleCount = workerManifest.include.length;
const excludeRuleCount = workerManifest.exclude.length;
const totalRuleCount = includeRuleCount + excludeRuleCount;

if (meteredPages.length > 0) {
  console.error(`${meteredPages.length} built pages are matched by an include rule in dist/_routes.json, so each is served by the metered Function on every view instead of as an unmetered static asset:`);
  for (const pathname of meteredPages.slice(0, 12)) console.error(`- ${pathname}`);
  if (meteredPages.length > 12) console.error(`- ...and ${meteredPages.length - 12} more`);
  console.error(`The manifest holds ${totalRuleCount} of the ${ROUTE_RULE_CAP} rules Cloudflare allows (${includeRuleCount} include, ${excludeRuleCount} exclude). The include list names the on-demand routes, so a prerendered page reaching the Function means one of those rules is wider than the route it stands for. Narrow it in the freetins:route-manifest integration in astro.config.mjs.`);
}

/*
 * Printed on every run, pass or fail. The first number is what the free plan
 * costs today; the second is how close the manifest is to the cliff that changes
 * the first without warning. Cloudflare counts include and exclude against one
 * cap, so this counts them the same way.
 */
console.log(`Free-plan guard: ${staticPageCount} of ${documentPathnames.length} built pages are served as static assets, and ${totalRuleCount} of ${ROUTE_RULE_CAP} _routes.json rules are in use (${includeRuleCount} include, ${excludeRuleCount} exclude).`);

if (totalRuleCount >= ROUTE_RULE_WARNING) {
  console.warn(`Warning: ${totalRuleCount} of ${ROUTE_RULE_CAP} rules is upgrade trigger 3 (docs/adr/0005-the-free-plan-is-the-design-target.md). Restructure routes so fewer rules cover more paths before Cloudflare stops reading the file.`);
}

if (
  prototypeLeaks.length > 0
  || missing.size > 0
  || invalidOnDemandRoutes.length > 0
  || manifestDisagrees
  || noindexSitemapLeaks.length > 0
  || sitemapGaps.length > 0
  || goneSitemapLeaks.length > 0
  || headingOrderLeaks.length > 0
  || titlesMissing.length > 0
  || titlesTooLong.length > 0
  || duplicateTitles.length > 0
  || graphsSplit.length > 0
  || graphsUnparsed.length > 0
  || graphIdCollisions.length > 0
  || graphDanglingRefs.length > 0
  || meteredPages.length > 0
  || meteredAssets.length > 0
) process.exit(1);

const sitemapEntries = (sitemap.match(/<loc>/g) ?? []).length;
const longestTitle = Math.max(0, ...[...titlesByText.keys()].map((title) => title.length));
console.log(`Route crawl passed: ${htmlFiles.length} documents, ${internalLinks} internal links, ${workerLinks} Worker links and ${sitemapEntries} sitemap entries checked. ${titlesByText.size} indexable titles, all unique, longest ${longestTitle} of ${TITLE_BUDGET} characters. One JSON-LD graph per page, every @id declared once and every reference resolved.`);
