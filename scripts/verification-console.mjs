/*
 * Builds the editor's verification console: one self-contained HTML file holding
 * every outstanding code, grouped by game.
 *
 * The console exists because the log the recorder reads is JSON, and asking an
 * editor to hand-write JSON for 196 entries is asking for a transcription error
 * with a star on the end of it. This generates the page from the record, so the
 * list can never be stale, and the page exports the recorder's own format rather
 * than inventing one.
 *
 * The output is deliberately not committed. It is a snapshot of what was
 * outstanding at the moment it was generated, and a stale copy of that is worse
 * than none: regenerate it, do not keep it.
 *
 *   pnpm queue:html                    write verification-console.html
 *   pnpm queue:html --out <path>       somewhere else
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OPERATIONS = resolve('src/content/operations.json');
const TEMPLATE = join(HERE, 'verification-console.template.html');

const argv = process.argv.slice(2);
const outIndex = argv.indexOf('--out');
const OUT = resolve(outIndex === -1 ? 'verification-console.html' : argv[outIndex + 1]);

const data = JSON.parse(readFileSync(OPERATIONS, 'utf8'));

const newestEvent = new Map();
for (const event of data.verificationEvents) {
  if (event.entryType !== 'code') continue;
  const held = newestEvent.get(event.entryId);
  if (!held || event.checkedAt > held.checkedAt) newestEvent.set(event.entryId, event);
}

const publishedGames = new Map(
  data.games
    .filter((game) => game.surface === 'codes' && game.publicationState === 'published')
    .map((game) => [game.slug, game]),
);

const byGame = new Map();
for (const entry of data.codes) {
  const game = publishedGames.get(entry.gameSlug);
  if (!game) continue;
  const event = newestEvent.get(entry.id);
  // Settled either way: an editor accepted it, or it is retired as expired.
  if (event?.result === 'accepted' && event.method !== 'manual-review') continue;
  if (event?.result === 'rejected') continue;
  if (!byGame.has(entry.gameSlug)) byGame.set(entry.gameSlug, { slug: entry.gameSlug, name: game.name, entries: [] });
  byGame.get(entry.gameSlug).entries.push({
    id: entry.id,
    code: entry.code,
    reward: entry.reward,
    source: entry.publisherSourceUrl ? 'publisher-confirmed' : 'community-reported',
  });
}

const games = [...byGame.values()].sort((left, right) => left.name.localeCompare(right.name));
const totalEntries = games.reduce((sum, game) => sum + game.entries.length, 0);

/*
 * `</script>` inside embedded JSON would close the tag that carries it, and
 * `<!--` opens a comment the HTML parser honours before the JS parser sees it.
 * Both are escaped rather than trusted: a game name or a reward string is
 * editorial text, and nothing stops one containing either.
 */
const payload = JSON.stringify({ games, totalEntries })
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e');

const html = readFileSync(TEMPLATE, 'utf8').replace('__QUEUE_DATA__', payload);
if (html.includes('__QUEUE_DATA__')) {
  console.error('The template no longer has a __QUEUE_DATA__ placeholder.');
  process.exit(1);
}

writeFileSync(OUT, html, 'utf8');
console.log(`Wrote ${OUT}`);
console.log(`  ${games.length} games, ${totalEntries} outstanding code entries.`);
console.log('  Open it in a browser. Marks are kept in that browser, so finish on one machine.');
console.log('  Export the JSON when done, or hand the .md to the agent.');
