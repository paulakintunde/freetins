import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sourcePath = resolve('src/content/operations.json');
const source = readFileSync(sourcePath, 'utf8');
const data = JSON.parse(source);
const errors = [];

const requiredArrays = ['games', 'codes', 'dailyLinks', 'cheatGames', 'cheats', 'values', 'updates', 'products', 'sponsorships', 'verificationEvents'];
for (const key of requiredArrays) {
  if (!Array.isArray(data[key])) errors.push(`${key} must be an array`);
}
if (!data.services || typeof data.services !== 'object') errors.push('services must be an object');

if (/example\.com/i.test(source)) errors.push('example.com is forbidden in operational content');
if (/\b\d+\s*(?:minutes?|mins?|hours?|days?|min|h|d)\s+ago\b/i.test(source)) errors.push('Relative “ago” strings are forbidden; upload ISO timestamps instead');

const unique = (items, key, label) => {
  const seen = new Set();
  for (const item of items ?? []) {
    const value = item?.[key];
    if (!value) errors.push(`${label} contains an entry without ${key}`);
    else if (seen.has(value)) errors.push(`${label} contains duplicate ${key}: ${value}`);
    else seen.add(value);
  }
};

unique(data.games, 'slug', 'games');
unique(data.codes, 'id', 'codes');
unique(data.dailyLinks, 'id', 'dailyLinks');
unique(data.cheatGames, 'slug', 'cheatGames');
unique(data.cheats, 'id', 'cheats');
unique(data.values, 'id', 'values');
unique(data.updates, 'id', 'updates');
unique(data.products, 'id', 'products');
unique(data.sponsorships, 'id', 'sponsorships');
unique(data.verificationEvents, 'id', 'verificationEvents');

if (errors.length > 0) {
  console.error('Operational content check failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

await import('../src/data/operations.ts');
console.log(`Operational content passed: ${data.games.length} games, ${data.codes.length} codes, ${data.dailyLinks.length} daily links, ${data.cheats.length} cheats and ${data.verificationEvents.length} verification events.`);
