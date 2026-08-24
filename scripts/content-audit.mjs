// Content audit over the built site. Reads dist/ only, so it measures what ships.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = 'dist';
const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
};
walk(ROOT);

const decode = (s = '') => s
  .replace(/&#8217;|&rsquo;/g, '\u2019').replace(/&#8216;/g, '\u2018')
  .replace(/&#8220;|&ldquo;/g, '\u201c').replace(/&#8221;|&rdquo;/g, '\u201d')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&[a-z]+;/gi, ' ');

const attr = (html, re) => (html.match(re)?.[1] ?? '').trim();
const textOf = (html) => decode(
  html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
).replace(/\s+/g, ' ').trim();
const words = (t) => t ? t.split(/\s+/).filter(Boolean).length : 0;

const pages = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file).split(sep).join('/');
  const path = rel === 'index.html' ? '/' : rel === '404.html' ? '/404' : '/' + rel.replace(/index\.html$/, '');

  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
  const article = main.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? main;

  // strip breadcrumbs + the trailing related-links nav so word counts reflect prose
  const body = main
    .replace(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<nav class="next-links"[\s\S]*?<\/nav>/gi, ' ');

  const title = decode(attr(head, /<title>([\s\S]*?)<\/title>/i));
  const description = decode(attr(head, /<meta name="description" content="([^"]*)"/i));
  const canonical = attr(head, /<link rel="canonical" href="([^"]*)"/i);
  const robots = attr(head, /<meta name="robots" content="([^"]*)"/i);
  const ogImage = attr(head, /<meta property="og:image" content="([^"]*)"/i);

  const h1s = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => textOf(m[1]));
  const headings = [...body.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ level: Number(m[1]), text: textOf(m[2]) }));

  const mainText = textOf(body);
  const wordCount = words(mainText);

  // links
  const links = [...body.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => ({ href: m[1], text: textOf(m[2]) }));
  const internal = links.filter((l) => l.href.startsWith('/'));
  const external = links.filter((l) => /^https?:\/\//.test(l.href) && !l.href.includes('freetins.com'));

  // images
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imgsNoAlt = imgs.filter((i) => !/\salt="[^"]+"/i.test(i)).length;

  // schema
  const ld = [...head.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const schemaTypes = new Set();
  const collect = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(collect);
    if (n['@type']) [].concat(n['@type']).forEach((t) => schemaTypes.add(t));
    Object.values(n).forEach(collect);
  };
  ld.forEach(collect);

  const dates = {
    published: (html.match(/"datePublished"\s*:\s*"([^"]+)"/) ?? [])[1] ?? null,
    modified: (html.match(/"dateModified"\s*:\s*"([^"]+)"/) ?? [])[1] ?? null,
  };

  pages.push({
    path, file: rel,
    kind: (main.match(/data-route-kind="([^"]+)"/) ?? [])[1] ?? (path === '/' ? 'home' : 'other'),
    title, titleLen: title.length,
    description, descLen: description.length,
    canonical, robots, noindex: /noindex/i.test(robots), ogImage,
    h1Count: h1s.length, h1: h1s[0] ?? '', headings,
    wordCount, mainText,
    internalLinks: internal.length, externalLinks: external.length,
    internalHrefs: internal.map((l) => l.href.split('#')[0]),
    externalHosts: [...new Set(external.map((l) => { try { return new URL(l.href).host; } catch { return 'invalid'; } }))],
    imgCount: imgs.length, imgsNoAlt,
    schemaTypes: [...schemaTypes],
    dates,
    bytes: statSync(file).size,
  });
}

writeFileSync(process.argv[2] ?? 'audit-pages.json', JSON.stringify(pages, null, 1));
console.log(`analyzed ${pages.length} pages`);
