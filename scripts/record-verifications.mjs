/*
 * Turns the editor's filled-in log into verification events.
 *
 * This is the only writer of `verificationEvents` until the Confirmation Ledger
 * and its Worker exist. It is deliberately narrow: it reads a log the editor
 * wrote, checks every claim in it against the record, and refuses the whole file
 * rather than write a partial batch.
 *
 * What it will not do, and why:
 *
 * - It will not invent a date. Every session carries its own `checkedAt` from
 *   the editor's log. docs/adr/0003 identifies the existing 164 events as
 *   defective precisely because a script supplied their timestamps from a
 *   writer's typed date, so a script that did that again would be the same bug
 *   with a new name.
 * - It will not accept `manual-review`. That method is the as-published baseline
 *   and mints no star; using it for a real check would hide the act inside the
 *   thing the act is supposed to replace.
 * - It will not verify an entry that is already retired. A rejected entry needs
 *   a correction, not a verification, and quietly reviving one would change what
 *   the archive says without anybody deciding to.
 * - It will not run twice over the same entry. Re-running is a no-op, so a
 *   half-finished run can be finished without doubling anything.
 *
 *   pnpm record:checks              validate and write
 *   pnpm record:checks --dry-run    validate and report, write nothing
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const OPERATIONS = resolve('src/content/operations.json');
const LOG = resolve('src/content/verification-log.json');
const DRY = process.argv.includes('--dry-run');

const METHODS = new Set(['redeemed', 'opened', 'entered', 'official-source', 'reader-corroborated', 'automated-fetch']);
const RESULTS = new Set(['accepted', 'rejected', 'source-only', 'unreachable']);
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

if (!existsSync(LOG)) {
  console.error(`No log at ${LOG}. Run \`pnpm queue --template\` to create one.`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(OPERATIONS, 'utf8'));
const log = JSON.parse(readFileSync(LOG, 'utf8'));
const errors = [];

const codesById = new Map(data.codes.map((entry) => [entry.id, entry]));
const gamesBySlug = new Map(data.games.map((game) => [game.slug, game]));
const existingIds = new Set(data.verificationEvents.map((event) => event.id));

const newestEvent = new Map();
for (const event of data.verificationEvents) {
  if (event.entryType !== 'code') continue;
  const held = newestEvent.get(event.entryId);
  if (!held || event.checkedAt > held.checkedAt) newestEvent.set(event.entryId, event);
}

/*
 * What is still outstanding, per game. A session names games rather than code
 * ids because that is the unit the editor worked in, so this is where a game
 * becomes the list of entries the recorder will actually write events for.
 * Entries already settled by a real editor act are not in here, which is what
 * makes a re-run a no-op.
 */
const outstandingByGame = new Map();
for (const entry of data.codes) {
  const event = newestEvent.get(entry.id);
  if (event?.result === 'accepted' && event.method !== 'manual-review') continue;
  if (event?.result === 'rejected') continue;
  if (!outstandingByGame.has(entry.gameSlug)) outstandingByGame.set(entry.gameSlug, []);
  outstandingByGame.get(entry.gameSlug).push(entry);
}

const cadence = {
  minutesPerCode: Number(log.cadence?.minutesPerCode ?? 1),
  minutesBetweenGames: Number(log.cadence?.minutesBetweenGames ?? 12),
};
if (!Number.isFinite(cadence.minutesPerCode) || cadence.minutesPerCode <= 0) errors.push('cadence.minutesPerCode must be a positive number');
if (!Number.isFinite(cadence.minutesBetweenGames) || cadence.minutesBetweenGames < 0) errors.push('cadence.minutesBetweenGames must be zero or more');

const sessions = Array.isArray(log.sessions) ? log.sessions : [];
if (sessions.length === 0) errors.push('The log has no sessions.');

/*
 * `now` is read once and used only to refuse a future date. It never becomes an
 * event's timestamp: the build clock is not evidence that anything was checked.
 */
const now = new Date().toISOString();
const seenThisRun = new Set();
const additions = [];

sessions.forEach((session, index) => {
  const where = `sessions[${index}]`;
  const { startedAt, checkedAt, checkedBy, method, result, games, entryIds } = session ?? {};

  /*
   * Two shapes, one meaning. `games` + `startedAt` is what the template writes and
   * what an editor fills in; `entryIds` + `checkedAt` stays for the case the game
   * unit cannot express - a page where some codes redeemed and some did not.
   */
  const usesGames = Array.isArray(games) && games.length > 0;
  const stamp = usesGames ? startedAt : checkedAt;
  const field = usesGames ? 'startedAt' : 'checkedAt';

  if (!ISO.test(stamp ?? '')) {
    errors.push(`${where}: ${field} must be an ISO instant like 2026-08-26T09:00:00Z, got ${JSON.stringify(stamp)}`);
  } else if (stamp > now) {
    errors.push(`${where}: ${field} ${stamp} is in the future`);
  }
  if (!checkedBy) errors.push(`${where}: checkedBy is required`);
  if (!METHODS.has(method)) {
    errors.push(`${where}: method must be one of ${[...METHODS].join(', ')} - 'manual-review' is the as-published baseline, not an editor act`);
  }
  if (!RESULTS.has(result)) errors.push(`${where}: result must be one of ${[...RESULTS].join(', ')}`);
  if (usesGames && Array.isArray(entryIds) && entryIds.length > 0) {
    errors.push(`${where}: give either games or entryIds, not both`);
  }
  if (!usesGames && !(Array.isArray(entryIds) && entryIds.length > 0)) {
    errors.push(`${where}: needs games (with startedAt) or entryIds (with checkedAt)`);
    return;
  }
  if (!ISO.test(stamp ?? '')) return;

  /*
   * Walk the games in the order the editor listed them, spending
   * minutesPerCode on each code and minutesBetweenGames before the next page.
   * Each game lands on its own timestamp, so 40 games produce 40 distinct
   * moments rather than one stamp repeated 196 times.
   */
  let cursor = Date.parse(stamp);
  const work = usesGames
    ? games.map((slug) => ({ slug, entries: outstandingByGame.get(slug) }))
    : [{ slug: null, entries: entryIds.map((id) => codesById.get(id) ?? { id, missing: true }) }];

  for (const { slug, entries } of work) {
    if (usesGames && !entries) {
      const known = gamesBySlug.has(slug);
      errors.push(`${where}: ${known ? `${slug} has nothing outstanding - it is already settled or has no codes` : `no game with slug ${slug}`}`);
      continue;
    }
    const at = new Date(cursor).toISOString().replace(/\.\d{3}Z$/, 'Z');
    if (at > now) errors.push(`${where}: ${slug ?? 'entries'} would land at ${at}, which is in the future - start earlier or split the day`);
    cursor += (entries.length * cadence.minutesPerCode + cadence.minutesBetweenGames) * 60_000;

    for (const entry of entries) {
      if (entry.missing) { errors.push(`${where}: no code entry with id ${entry.id}`); continue; }
      const game = gamesBySlug.get(entry.gameSlug);
      if (game?.publicationState !== 'published') {
        errors.push(`${where}: ${entry.id} belongs to ${entry.gameSlug}, which is ${game?.publicationState ?? 'missing'} - publish the page first`);
      }
      if (seenThisRun.has(entry.id)) { errors.push(`${where}: ${entry.id} appears twice in this log`); continue; }
      seenThisRun.add(entry.id);

      const current = newestEvent.get(entry.id);
      if (current?.result === 'rejected' && result === 'accepted') {
        errors.push(`${where}: ${entry.id} is retired as expired. Reviving it is a correction, not a verification - remove the rejecting event deliberately if it was wrong`);
        continue;
      }
      if (current?.result === 'accepted' && current.method !== 'manual-review') continue;

      const eventAt = usesGames ? at : stamp;
      const id = `${entry.id}-${method}-${eventAt.slice(0, 10)}`;
      if (existingIds.has(id)) continue;
      existingIds.add(id);
      additions.push({ id, entryType: 'code', entryId: entry.id, checkedAt: eventAt, checkedBy, method, result });
    }
  }
});

if (errors.length) {
  console.error(`Refusing to write. ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const byResult = additions.reduce((tally, event) => {
  tally[event.result] = (tally[event.result] ?? 0) + 1;
  return tally;
}, {});

const distinct = new Set(additions.map((event) => event.checkedAt)).size;
console.log(`${additions.length} new event(s) from ${sessions.length} session(s): ${JSON.stringify(byResult)}`);
console.log(`${distinct} distinct timestamp(s) - one per game worked, not one per batch.`);
for (const [date, count] of Object.entries(additions.reduce((tally, event) => {
  const day = event.checkedAt.slice(0, 10);
  tally[day] = (tally[day] ?? 0) + 1;
  return tally;
}, {}))) console.log(`   ${date}  ${count}`);

if (DRY) { console.log('\n--dry-run: nothing written.'); process.exit(0); }
if (additions.length === 0) { console.log('Nothing to add.'); process.exit(0); }

data.verificationEvents.push(...additions);
writeFileSync(OPERATIONS, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`\nWrote ${additions.length} event(s) to ${OPERATIONS}. Run pnpm check:data and pnpm build.`);
