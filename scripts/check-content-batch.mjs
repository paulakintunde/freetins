import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const publishedPaths = [
  '/codes/shindo-life/',
  '/codes/king-legacy/',
  '/cheats/gta-5/',
  '/cheats/the-sims-4/',
  '/cheats/minecraft/',
  '/cheats/baldurs-gate-3/',
  '/answers/wordscapes/',
  '/guides/candy-crush-free-boosters/',
  '/guides/best-gba-emulators/',
  '/guides/best-gba-games/',
];

const errors = [];
const searchIndex = JSON.parse(await readFile('dist/search-index.json', 'utf8')).records;

for (const route of publishedPaths) {
  const output = path.join('dist', ...route.split('/').filter(Boolean), 'index.html');
  let html;
  try {
    html = await readFile(output, 'utf8');
  } catch {
    errors.push(`${route} has no built HTML file`);
    continue;
  }

  const expectedCanonical = `https://freetins.com${route}`;
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  if (h1Count !== 1) errors.push(`${route} has ${h1Count} H1 elements`);
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}">`)) errors.push(`${route} has the wrong canonical`);
  if (!html.includes('<meta name="robots" content="index, follow, max-image-preview:large">')) errors.push(`${route} is not indexable`);
  if (!html.includes('<meta property="og:image"')) errors.push(`${route} has no OG image`);
  if (!html.includes('<img ')) errors.push(`${route} has no rendered image`);
  if (/AFFILIATE-LINK|\[PLACEHOLDER\]|example\.com/i.test(html)) errors.push(`${route} contains a placeholder`);
  if (!searchIndex.some((entry) => entry.path === route)) errors.push(`${route} is absent from search-index.json`);

  const socialImage = html.match(/<meta property="og:image" content="https:\/\/freetins\.com([^\"]+)">/)?.[1];
  if (socialImage?.startsWith('/og/')) {
    try {
      await access(path.join('public', ...socialImage.split('/').filter(Boolean)));
    } catch {
      errors.push(`${route} references a missing social image: ${socialImage}`);
    }
  }
}

if (errors.length > 0) throw new Error(`Batch validation failed:\n- ${errors.join('\n- ')}`);
console.log(`Batch validation passed: ${publishedPaths.length} indexable routes with canonical, H1, artwork, social image and search records.`);
