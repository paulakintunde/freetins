/**
 * Move confirmed sources from the register into the operational model.
 *
 * Phase 1 produced src/content/source-register.json. That file is research; it
 * does not affect the site. This script writes the confirmed tier 0 channels into
 * `publisherChannels` on each game in operations.json, which is the field the
 * build validator already enforces against.
 *
 * That enforcement is the point. `validateOperations` refuses any entry whose
 * `publisherSourceUrl` host is not a declared `publisherChannel` for its game, so
 * until this runs, no code can cite a publisher source without failing the build.
 * Populating the field is what unblocks publisher-sourced evidence — and because
 * the check is host-based, it also means a code cannot be promoted to publisher
 * evidence by pointing at a channel nobody confirmed.
 *
 * Only `status: "confirmed"` sources are written. Candidates, dead invites and
 * channels marked unreachable stay in the register as research and are deliberately
 * NOT declared, because declaring a channel is an assertion that the studio
 * controls it.
 *
 * Idempotent: re-running replaces the generated channels and leaves any that were
 * added by hand.
 *
 * Usage:
 *   node scripts/apply-source-register.mjs [--dry-run]
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src', 'content');
const operationsPath = path.join(contentDir, 'operations.json');
const dryRun = process.argv.includes('--dry-run');

const register = JSON.parse(await readFile(path.join(contentDir, 'source-register.json'), 'utf8'));
const operations = JSON.parse(await readFile(operationsPath, 'utf8'));

/** `PublisherChannelType` in src/data/operations.ts. Anything else cannot be declared. */
const DECLARABLE = new Set(['website', 'youtube', 'discord', 'twitch', 'x', 'twitter']);

const labelFor = (source, gameName) => {
  if (source.platform === 'discord') {
    return source.displayName ? `${source.displayName} Discord` : `${gameName} Discord`;
  }
  return `${gameName} ${source.platform}`;
};

const registerBySlug = new Map(register.games.map((game) => [game.gameSlug, game]));

let gamesTouched = 0;
let channelsWritten = 0;
const skipped = [];

for (const game of operations.games) {
  const entry = registerBySlug.get(game.slug);
  if (!entry) continue;

  const declarable = entry.sources.filter((source) => {
    if (source.status !== 'confirmed') {
      skipped.push(`${game.slug}/${source.platform}: status is "${source.status}"`);
      return false;
    }
    if (!DECLARABLE.has(source.platform)) {
      skipped.push(`${game.slug}/${source.platform}: not a declarable channel type`);
      return false;
    }
    if (!source.locator?.inviteUrl && !source.locator?.url) {
      skipped.push(`${game.slug}/${source.platform}: no URL`);
      return false;
    }
    return true;
  });

  if (declarable.length === 0) continue;

  const generated = declarable.map((source) => ({
    type: source.platform,
    url: source.locator.inviteUrl ?? source.locator.url,
    label: labelFor(source, game.name),
  }));

  const generatedUrls = new Set(generated.map((channel) => channel.url));
  const handAdded = (game.publisherChannels ?? []).filter((channel) => !generatedUrls.has(channel.url));

  game.publisherChannels = [...generated, ...handAdded];
  gamesTouched += 1;
  channelsWritten += generated.length;
  console.log(`  ${game.slug.padEnd(28)} ${generated.map((c) => c.type).join(', ')}`);
}

console.log('\n--- Applied ---');
console.log(`Games given publisher channels: ${gamesTouched}`);
console.log(`Channels written:               ${channelsWritten}`);
console.log(`Sources deliberately skipped:   ${skipped.length}`);
for (const note of skipped) console.log(`  - ${note}`);

if (dryRun) {
  console.log('\n--dry-run: operations.json not written.');
} else {
  await writeFile(operationsPath, `${JSON.stringify(operations, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${path.relative(root, operationsPath)}`);
}
