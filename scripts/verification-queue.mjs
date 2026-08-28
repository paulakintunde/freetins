/*
 * The editor's checklist: every code entry no editor has acted on yet.
 *
 * docs/adr/0003 retires `verify/<slug>-VERIFY.md` in favour of "a checklist
 * generated from the dataset by the control page's run-this-game flow from Step
 * 2a", and says that "between Steps 1a and 2a the `pnpm queue` printout is the
 * checklist". Step 2a does not exist yet, so this is that printout: it reads the
 * record rather than a hand-maintained list, so it cannot drift from what the
 * pages actually publish.
 *
 * It asserts nothing. It prints what is outstanding and, with --template, writes
 * a log file for the editor to fill in with the dates they actually worked. The
 * events themselves are written by scripts/record-verifications.mjs from that
 * filled-in log, never from here.
 *
 *   pnpm queue                      the checklist, grouped by game
 *   pnpm queue --template           also write src/content/verification-log.json
 *   pnpm queue --game <slug>        one game only
 *   pnpm queue --json               machine-readable
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const OPERATIONS = resolve('src/content/operations.json');
const LOG = resolve('src/content/verification-log.json');

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? undefined : argv[index + 1];
};

const data = JSON.parse(readFileSync(OPERATIONS, 'utf8'));

/*
 * The newest event on an entry decides its state, so the queue asks the same
 * question the site does rather than a similar one. `accepted` is an editor
 * acceptance and `rejected` retires the row; both mean the entry is settled.
 * `source-only` and `unreachable` leave it Listed and still outstanding.
 */
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

const outstanding = [];
const settled = { verified: 0, expired: 0 };
for (const entry of data.codes) {
  const game = publishedGames.get(entry.gameSlug);
  if (!game) continue;
  const event = newestEvent.get(entry.id);
  if (event?.result === 'accepted') { settled.verified += 1; continue; }
  if (event?.result === 'rejected') { settled.expired += 1; continue; }
  outstanding.push({ ...entry, gameName: game.name, currentEvent: event?.result ?? null });
}

const only = value('game');
const listed = only ? outstanding.filter((entry) => entry.gameSlug === only) : outstanding;

if (flag('json')) {
  console.log(JSON.stringify({ outstanding: listed, settled }, null, 2));
  process.exit(0);
}

const byGame = new Map();
for (const entry of listed) {
  if (!byGame.has(entry.gameSlug)) byGame.set(entry.gameSlug, []);
  byGame.get(entry.gameSlug).push(entry);
}

console.log(`Verification queue: ${listed.length} code entries across ${byGame.size} published pages.`);
console.log(`Already settled: ${settled.verified} verified, ${settled.expired} retired as expired.\n`);

for (const [slug, entries] of [...byGame].sort()) {
  console.log(`  ${entries[0].gameName}  (/codes/${slug}/)  ${entries.length} entries`);
  for (const entry of entries) {
    const source = entry.publisherSourceUrl ? 'publisher-confirmed' : 'community-reported';
    console.log(`     [ ] ${entry.id.padEnd(38)} ${entry.code.padEnd(26)} ${entry.reward} · ${source}`);
  }
  console.log('');
}

console.log('Tick what redeemed. Record the result with:');
console.log('  pnpm queue --template          write the log file to fill in');
console.log('  pnpm record:checks             turn the filled log into events\n');

if (flag('template')) {
  if (existsSync(LOG)) {
    console.error(`Refusing to overwrite ${LOG}. Edit it, or delete it first.`);
    process.exit(1);
  }
  /*
   * One block per working day rather than one stamp for the batch. ADR 0003
   * names the existing batch timestamps as the evidence that a script invented
   * the events it wrote ("sixty-six of them share two batch timestamps"), so the
   * shape of this file is the argument against repeating that: a date the editor
   * did not work is a date they have to delete.
   */
  const template = {
    $comment: [
      'The editor\'s own log. One block per day actually worked.',
      'checkedBy: the editor id, matching src/data/authors.ts.',
      'method: how the entry was tested. `redeemed` means the code was entered in the',
      '  game and the reward arrived. Do not use `manual-review`: that is the',
      '  as-published baseline, not an editor act, and it mints no star.',
      'result: `accepted` if it redeemed, `rejected` if it did not.',
      'entryIds: the ids from `pnpm queue`.',
      'Delete any day block that did not happen. scripts/record-verifications.mjs',
      '  refuses unknown ids, duplicate work and future dates.',
    ],
    sessions: [
      {
        checkedAt: 'YYYY-MM-DDTHH:MM:SSZ',
        checkedBy: 'paul-a',
        method: 'redeemed',
        result: 'accepted',
        entryIds: listed.slice(0, 3).map((entry) => entry.id),
      },
    ],
  };
  writeFileSync(LOG, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${LOG} with ${listed.length} entries outstanding. Fill in the sessions and run pnpm record:checks.`);
}
