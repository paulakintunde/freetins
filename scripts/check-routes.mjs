import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const outputRoot = resolve('dist');

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

const missing = new Map();
const prototypeLeaks = [];
let internalLinks = 0;

const resolvesToDocument = (pathname) => {
  if (pathname === '/') return existsSync(join(outputRoot, 'index.html'));
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
  return existsSync(join(outputRoot, cleanPath, 'index.html')) || existsSync(join(outputRoot, `${cleanPath}.html`));
};

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');

  if (/file:\/\/\/|Freetins%20Site\.dc\.html|href=["']#(?:home|browse|daily|hub|codes|cheats)/i.test(html)) {
    prototypeLeaks.push(file);
  }

  const links = html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi);
  for (const [, href] of links) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    const url = new URL(href, 'https://freetins.test');
    if (url.origin !== 'https://freetins.test') continue;

    internalLinks += 1;
    if (!resolvesToDocument(url.pathname)) {
      const sources = missing.get(url.pathname) ?? [];
      sources.push(file);
      missing.set(url.pathname, sources);
    }
  }
}

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

if (prototypeLeaks.length > 0 || missing.size > 0) process.exit(1);

console.log(`Route crawl passed: ${htmlFiles.length} documents and ${internalLinks} internal links checked.`);
