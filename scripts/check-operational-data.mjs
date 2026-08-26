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

const ops = await import('../src/data/operations.ts');
console.log(`Operational content passed: ${data.games.length} games, ${data.codes.length} codes, ${data.dailyLinks.length} daily links, ${data.cheats.length} cheats and ${data.verificationEvents.length} verification events.`);

/*
 * Advisory queue printout. Nothing below changes the exit code. The furniture a
 * page wants (its own listing URL, two redeem steps) left the index gate with
 * ADR 0004: a page with a live entry is indexed whether or not the furniture is
 * there, and its absence is a warning for the editor queue, not a reason to hold
 * the page. The baseline count is the interim "typed claims to confirm" line
 * ADR 0003 asks for until the control page's queue exists.
 */
const queueWarnings = [];
for (const game of ops.operations.games) {
  if (game.publicationState !== 'planned') continue;
  const page = ops.getGameOperationalPage(game.slug);
  if (!page || page.liveCount === 0) continue;
  const missing = [];
  if (!game.officialSourceUrl) missing.push('no officialSourceUrl');
  if (game.redeemSteps.length < 2) missing.push(`${game.redeemSteps.length} of 2 redeemSteps`);
  if (missing.length === 0) continue;
  const noun = game.surface === 'codes' ? 'codes' : 'links';
  queueWarnings.push(`${game.slug} lists ${page.liveCount} live ${noun} with ${missing.join(' and ')}`);
}
if (queueWarnings.length > 0) {
  console.log(`Queue warnings (advisory, ${queueWarnings.length}):`);
  queueWarnings.forEach((warning) => console.log(`- ${warning}`));
} else {
  console.log('Queue warnings (advisory): none. Every planned page with a live entry has its listing URL and two redeem steps.');
}

const baselineEvents = data.verificationEvents.filter((event) => event.method === 'manual-review').length;
console.log(`Baseline (advisory): ${baselineEvents} of ${data.verificationEvents.length} verification events are manual-review and are read as the as-published baseline, not as editor acts.`);
