import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { goneRoutes } from '../src/data/gone.ts';

const outputRoot = resolve('dist');
const renderingContractPath = resolve('src/data/route-rendering.json');

if (!existsSync(outputRoot)) {
  throw new Error('dist is missing. Run pnpm build before pnpm check:routes.');
}

const htmlFiles = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
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

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');

  if (/file:\/\/\/|Freetins%20Site\.dc\.html|href=["']#(?:home|browse|daily|hub|codes|cheats)/i.test(html)) {
    prototypeLeaks.push(file);
  }

  if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
    if (canonical && sitemap.includes(`<loc>${canonical}</loc>`)) noindexSitemapLeaks.push(canonical);
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

const invalidOnDemandRoutes = renderingContract.onDemandRoutePaths.filter(
  (pathname) => resolvesToDocument(pathname) || !resolvesOnWorker(pathname),
);

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
  for (const pathname of invalidOnDemandRoutes) console.error(`- ${pathname}`);
}

if (noindexSitemapLeaks.length > 0) {
  console.error('Noindex routes leaked into the sitemap:');
  for (const canonical of noindexSitemapLeaks) console.error(`- ${canonical}`);
}

if (goneSitemapLeaks.length > 0) {
  console.error('Removed (410) routes leaked into the sitemap:');
  for (const route of goneSitemapLeaks) console.error(`- ${route}`);
  console.error('Add them to excludedFromSitemap in astro.config.mjs.');
}

if (
  prototypeLeaks.length > 0
  || missing.size > 0
  || invalidOnDemandRoutes.length > 0
  || noindexSitemapLeaks.length > 0
  || goneSitemapLeaks.length > 0
) process.exit(1);

const sitemapEntries = (sitemap.match(/<loc>/g) ?? []).length;
console.log(`Route crawl passed: ${htmlFiles.length} documents, ${internalLinks} internal links, ${workerLinks} Worker links and ${sitemapEntries} sitemap entries checked.`);
