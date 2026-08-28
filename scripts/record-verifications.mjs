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
  const { checkedAt, checkedBy, method, result, entryIds } = session ?? {};

  if (!ISO.test(checkedAt ?? '')) {
    errors.push(`${where}: checkedAt must be an ISO instant like 2026-08-27T14:00:00Z, got ${JSON.stringify(checkedAt)}`);
  } else if (checkedAt > now) {
    errors.push(`${where}: checkedAt ${checkedAt} is in the future`);
  }
  if (!checkedBy) errors.push(`${where}: checkedBy is required`);
  if (!METHODS.has(method)) {
    errors.push(`${where}: method must be one of ${[...METHODS].join(', ')} - 'manual-review' is the as-published baseline, not an editor act`);
  }
  if (!RESULTS.has(result)) errors.push(`${where}: result must be one of ${[...RESULTS].join(', ')}`);
  if (!Array.isArray(entryIds) || entryIds.length === 0) {
    errors.push(`${where}: entryIds must be a non-empty array`);
    return;
  }

  for (const entryId of entryIds) {
    const entry = codesById.get(entryId);
    if (!entry) { errors.push(`${where}: no code entry with id ${entryId}`); continue; }

    const game = gamesBySlug.get(entry.gameSlug);
    if (game?.publicationState !== 'published') {
      errors.push(`${where}: ${entryId} belongs to ${entry.gameSlug}, which is ${game?.publicationState ?? 'missing'} - publish the page first`);
    }
    if (seenThisRun.has(entryId)) { errors.push(`${where}: ${entryId} appears twice in this log`); continue; }
    seenThisRun.add(entryId);

    const current = newestEvent.get(entryId);
    if (current?.result === 'rejected' && result === 'accepted') {
      errors.push(`${where}: ${entryId} is retired as expired. Reviving it is a correction, not a verification - remove the rejecting event deliberately if it was wrong`);
      continue;
    }
    if (current?.result === 'accepted' && current.method !== 'manual-review') {
      // Already carries a real editor acceptance: nothing to add, and saying so twice is noise.
      continue;
    }

    const id = `${entryId}-${method}-${checkedAt.slice(0, 10)}`;
    if (existingIds.has(id)) continue;
    existingIds.add(id);
    additions.push({ id, entryType: 'code', entryId, checkedAt, checkedBy, method, result });
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

console.log(`${additions.length} new event(s) from ${sessions.length} session(s): ${JSON.stringify(byResult)}`);
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
