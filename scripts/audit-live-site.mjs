import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { performance } from 'node:perf_hooks';

const baseUrl = new URL(process.argv[2] ?? 'https://freetins.pages.dev/');
const outputPath = resolve(process.argv[3] ?? 'output/audit/live-site-audit.json');
const distRoot = resolve('dist');
const concurrency = 10;

const securityHeaders = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
];

const getTags = (html, tagName) => html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];

const getAttribute = (tag, attribute) => {
  const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? null;
};

const hasAttribute = (tag, attribute) => new RegExp(`\\b${attribute}(?:\\s*=|\\s|>|$)`, 'i').test(tag);

const stripTags = (value) => value
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const percentile = (values, ratio) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
};

const countBy = (values, getKey) => {
  const counts = {};
  for (const value of values) {
    const key = String(getKey(value));
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
};

const duplicateValues = (pages, key) => {
  const entries = new Map();
  for (const page of pages) {
    const value = page[key];
    if (!value) continue;
    const paths = entries.get(value) ?? [];
    paths.push(page.path);
    entries.set(value, paths);
  }
  return [...entries.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([value, paths]) => ({ value, paths }));
};

const walkHtml = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkHtml(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
};

const routeFromFile = (file) => {
  const path = relative(distRoot, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'index.html'.length)}`;
  return `/${path}`;
};

const mapConcurrent = async (items, limit, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

const inspectHtml = (html, path) => {
  const mainContent = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const visibleMainText = stripTags(mainContent);
  const title = stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const metaTags = getTags(html, 'meta');
  const linkTags = getTags(html, 'link');
  const scriptTags = getTags(html, 'script');
  const imageTags = getTags(html, 'img');
  const inputMatches = [...html.matchAll(/<input\b[^>]*>/gi)];
  const inputTags = inputMatches.map((match) => match[0]);
  const anchorMatches = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  const buttonMatches = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
  const formMatches = [...html.matchAll(/<form\b([^>]*)>/gi)];
  const jsonLdMatches = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  const descriptionTag = metaTags.find((tag) => getAttribute(tag, 'name')?.toLowerCase() === 'description');
  const robotsTag = metaTags.find((tag) => getAttribute(tag, 'name')?.toLowerCase() === 'robots');
  const canonicalTag = linkTags.find((tag) => getAttribute(tag, 'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const h2Count = (html.match(/<h2\b/gi) ?? []).length;
  const missingImageAlt = imageTags.filter((tag) => !hasAttribute(tag, 'alt')).length;
  const emptyLinks = anchorMatches.filter((match) => {
    const attributes = match[1];
    const content = match[2];
    const ariaLabel = getAttribute(attributes, 'aria-label');
    const imageAlt = getTags(content, 'img').map((tag) => getAttribute(tag, 'alt')).filter(Boolean).join(' ');
    return !ariaLabel && !stripTags(content) && !imageAlt;
  }).length;
  const unnamedButtons = buttonMatches.filter((match) => {
    const attributes = match[1];
    return !getAttribute(attributes, 'aria-label') && !getAttribute(attributes, 'title') && !stripTags(match[2]);
  }).length;
  const unlabeledInputs = inputMatches.filter((match) => {
    const tag = match[0];
    const type = getAttribute(tag, 'type')?.toLowerCase();
    if (['hidden', 'submit', 'button', 'reset'].includes(type)) return false;
    const id = getAttribute(tag, 'id');
    const hasLabel = id && new RegExp(`<label\\b[^>]*for=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html);
    const start = match.index ?? 0;
    const hasImplicitLabel = html.lastIndexOf('<label', start) > html.lastIndexOf('</label>', start);
    return !hasLabel && !hasImplicitLabel && !getAttribute(tag, 'aria-label') && !getAttribute(tag, 'aria-labelledby');
  }).length;

  const jsonLdErrors = [];
  for (const match of jsonLdMatches) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      jsonLdErrors.push(error.message);
    }
  }

  const links = anchorMatches.map((match) => ({
    href: getAttribute(match[1], 'href'),
    target: getAttribute(match[1], 'target'),
    rel: getAttribute(match[1], 'rel'),
  })).filter((link) => link.href);

  const forms = formMatches.map((match) => ({
    action: getAttribute(match[1], 'action') ?? path,
    method: (getAttribute(match[1], 'method') ?? 'get').toLowerCase(),
  }));

  return {
    title,
    description: getAttribute(descriptionTag ?? '', 'content'),
    robots: getAttribute(robotsTag ?? '', 'content'),
    canonical: getAttribute(canonicalTag ?? '', 'href'),
    h1Count,
    h2Count,
    wordCount: visibleMainText ? visibleMainText.split(/\s+/).length : 0,
    imageCount: imageTags.length,
    missingImageAlt,
    emptyLinks,
    unnamedButtons,
    unlabeledInputs,
    jsonLdCount: jsonLdMatches.length,
    jsonLdErrors,
    links,
    forms,
    mixedContentReferences: [...new Set(html.match(/http:\/\/[^"'\s<]+/gi) ?? [])],
    analyticsSignatures: [...new Set((html.match(/plausible\.io\/js|data-domain=|googletagmanager\.com|google-analytics\.com|gtag\(|matomo\.js|clarity\.ms\/tag|cdn\.usefathom\.com/gi) ?? []).map((item) => item.toLowerCase()))],
    inlineExecutableScripts: scriptTags.filter((tag) => !getAttribute(tag, 'src') && getAttribute(tag, 'type')?.toLowerCase() !== 'application/ld+json').length,
    scriptsAfterHtml: html.slice(Math.max(0, html.toLowerCase().indexOf('</html>'))).match(/<script\b/gi)?.length ?? 0,
    inlineEventHandlers: (html.match(/\son(?:click|load|error|submit|change)=/gi) ?? []).length,
    blankTargetsWithoutNoopener: links.filter((link) => link.target === '_blank' && !link.rel?.split(/\s+/).includes('noopener')).length,
  };
};

const fetchPage = async (path) => {
  const url = new URL(path, baseUrl);
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'FreetinsAudit/1.0 (+https://freetins.pages.dev/)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    const headersAt = performance.now();
    const html = await response.text();
    const completedAt = performance.now();
    return {
      path,
      requestedUrl: url.href,
      finalUrl: response.url,
      status: response.status,
      contentType: response.headers.get('content-type'),
      cacheControl: response.headers.get('cache-control'),
      contentEncoding: response.headers.get('content-encoding'),
      contentLength: Buffer.byteLength(html),
      ttfbMs: Math.round(headersAt - startedAt),
      durationMs: Math.round(completedAt - startedAt),
      headers: Object.fromEntries(securityHeaders.map((name) => [name, response.headers.get(name)])),
      ...inspectHtml(html, path),
    };
  } catch (error) {
    return { path, requestedUrl: url.href, error: error.message };
  }
};

const fetchTextResource = async (path) => {
  try {
    const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(20_000) });
    return {
      path,
      status: response.status,
      contentType: response.headers.get('content-type'),
      cacheControl: response.headers.get('cache-control'),
      body: await response.text(),
    };
  } catch (error) {
    return { path, error: error.message };
  }
};

const htmlFiles = await walkHtml(distRoot);
const routes = [...new Set(htmlFiles.map(routeFromFile))].sort();
const pages = await mapConcurrent(routes, concurrency, fetchPage);
const successfulPages = pages.filter((page) => page.status && page.contentType?.includes('text/html'));
const pageByPath = new Map(successfulPages.map((page) => [new URL(page.requestedUrl).pathname, page]));

const brokenInternalLinks = [];
const internalLinksToNoindex = [];
const externalOrigins = new Set();
for (const page of successfulPages) {
  for (const link of page.links) {
    let url;
    try {
      url = new URL(link.href, page.requestedUrl);
    } catch {
      brokenInternalLinks.push({ source: page.path, href: link.href, reason: 'invalid URL' });
      continue;
    }
    if (!['http:', 'https:'].includes(url.protocol)) continue;
    if (url.origin !== baseUrl.origin) {
      externalOrigins.add(url.origin);
      continue;
    }
    const target = pageByPath.get(url.pathname);
    if (!target) brokenInternalLinks.push({ source: page.path, href: link.href, reason: 'not in generated route set' });
    else if (/noindex/i.test(target.robots ?? '')) internalLinksToNoindex.push({ source: page.path, target: url.pathname });
  }
}

const [robots, sitemapIndex, sitemap, notFoundPage] = await Promise.all([
  fetchTextResource('/robots.txt'),
  fetchTextResource('/sitemap-index.xml'),
  fetchTextResource('/sitemap-0.xml'),
  fetchPage('/this-route-should-not-exist-freetins-audit/'),
]);
const sitemapLocations = [...(sitemap.body?.matchAll(/<loc>(.*?)<\/loc>/gi) ?? [])].map((match) => match[1]);
const indexablePages = successfulPages.filter((page) => page.status === 200 && !/noindex/i.test(page.robots ?? ''));
const sitemapPaths = new Set(sitemapLocations.map((location) => new URL(location).pathname));
const noindexPaths = new Set(successfulPages.filter((page) => /noindex/i.test(page.robots ?? '')).map((page) => new URL(page.requestedUrl).pathname));
const robotDisallows = [...(robots.body?.matchAll(/^Disallow:\s*(\S+)/gim) ?? [])].map((match) => match[1]);

const times = successfulPages.map((page) => page.ttfbMs);
const durations = successfulPages.map((page) => page.durationMs);
const sizes = successfulPages.map((page) => page.contentLength);
const root = successfulPages.find((page) => page.path === '/');
const missingSecurityHeaders = securityHeaders.filter((name) => !root?.headers?.[name]);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: baseUrl.href,
  routeSource: 'dist/**/*.html',
  summary: {
    routesChecked: pages.length,
    statusCounts: countBy(pages, (page) => page.status ?? 'fetch-error'),
    indexablePages: indexablePages.length,
    noindexPages: successfulPages.filter((page) => /noindex/i.test(page.robots ?? '')).length,
    brokenInternalLinks: brokenInternalLinks.length,
    internalLinksToNoindex: internalLinksToNoindex.length,
    duplicateTitles: duplicateValues(successfulPages, 'title').length,
    duplicateDescriptions: duplicateValues(successfulPages, 'description').length,
    canonicalHostMismatches: successfulPages.filter((page) => page.canonical && new URL(page.canonical).origin !== baseUrl.origin).length,
    pagesWithoutCanonical: successfulPages.filter((page) => !page.canonical).length,
    pagesWithoutDescription: successfulPages.filter((page) => !page.description).length,
    pagesWithInvalidH1Count: successfulPages.filter((page) => page.h1Count !== 1).length,
    pagesWithMissingImageAlt: successfulPages.filter((page) => page.missingImageAlt > 0).length,
    pagesWithUnlabeledInputs: successfulPages.filter((page) => page.unlabeledInputs > 0).length,
    pagesWithUnnamedButtons: successfulPages.filter((page) => page.unnamedButtons > 0).length,
    pagesWithEmptyLinks: successfulPages.filter((page) => page.emptyLinks > 0).length,
    pagesWithJsonLdErrors: successfulPages.filter((page) => page.jsonLdErrors.length > 0).length,
    indexablePagesUnder300Words: indexablePages.filter((page) => page.wordCount < 300).length,
    indexablePagesUnder500Words: indexablePages.filter((page) => page.wordCount < 500).length,
    pagesWithMixedContent: successfulPages.filter((page) => page.mixedContentReferences.length > 0).length,
    pagesWithAnalyticsSignatures: successfulPages.filter((page) => page.analyticsSignatures.length > 0).length,
    pagesWithInlineExecutableScripts: successfulPages.filter((page) => page.inlineExecutableScripts > 0).length,
    pagesWithScriptsAfterHtml: successfulPages.filter((page) => page.scriptsAfterHtml > 0).length,
    forms: successfulPages.reduce((sum, page) => sum + page.forms.length, 0),
    missingSecurityHeaders,
    responseTimingMs: {
      ttfbMedian: percentile(times, 0.5),
      ttfbP95: percentile(times, 0.95),
      ttfbMax: Math.max(...times),
      durationMedian: percentile(durations, 0.5),
      durationP95: percentile(durations, 0.95),
      durationMax: Math.max(...durations),
    },
    htmlBytes: {
      median: percentile(sizes, 0.5),
      p95: percentile(sizes, 0.95),
      max: Math.max(...sizes),
    },
  },
  deployment: {
    rootHeaders: root?.headers ?? null,
    rootCacheControl: root?.cacheControl ?? null,
    robots: { status: robots.status, body: robots.body },
    sitemapIndex: { status: sitemapIndex.status, body: sitemapIndex.body },
    sitemap: {
      status: sitemap.status,
      urls: sitemapLocations.length,
      origins: [...new Set(sitemapLocations.map((location) => new URL(location).origin))],
      missingIndexablePaths: indexablePages.map((page) => new URL(page.requestedUrl).pathname).filter((path) => !sitemapPaths.has(path)),
      noindexPaths: [...sitemapPaths].filter((path) => noindexPaths.has(path)),
      robotBlockedPaths: [...sitemapPaths].filter((path) => robotDisallows.some((prefix) => path.startsWith(prefix))),
    },
    notFoundPage,
    externalOrigins: [...externalOrigins].sort(),
  },
  duplicates: {
    titles: duplicateValues(successfulPages, 'title'),
    descriptions: duplicateValues(successfulPages, 'description'),
  },
  brokenInternalLinks,
  internalLinksToNoindex,
  pages,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Audit evidence written to ${outputPath}`);
