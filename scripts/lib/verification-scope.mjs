/*
 * Which pages an editor may record a check against, and what is outstanding on
 * them. Shared by the queue, the console and the recorder so the three cannot
 * answer the question differently.
 *
 * The first version of all three asked `publicationState === 'published'`, which
 * is not the rule the site uses. `isIndexable` in src/data/operations.ts says a
 * game is indexable unless it is retired, and a `planned` game becomes indexable
 * the moment it has one live entry. Ten games sat in exactly that position:
 * `planned`, publicly indexed, 26 codes rendering to readers - and invisible to
 * the queue, with the recorder refusing them for not being published. An editor
 * could not record a check on a page Google could already see.
 *
 * ADR 0004 is the reason that is the wrong way round. Indexing is never gated on
 * verification, so anything indexed has to be checkable; the tooling was gating
 * the check on the publication flag instead.
 *
 * This is the same rule as `isIndexable`, restated because these are .mjs
 * scripts and cannot import the TypeScript module. If that function changes,
 * change this with it.
 */

/** The newest event per code entry, which is what decides its state. */
export const newestEventsByEntry = (operations) => {
  const newest = new Map();
  for (const event of operations.verificationEvents) {
    if (event.entryType !== 'code') continue;
    const held = newest.get(event.entryId);
    if (!held || event.checkedAt > held.checkedAt) newest.set(event.entryId, event);
  }
  return newest;
};

const settled = (event) => {
  if (!event) return null;
  if (event.result === 'rejected') return 'expired';
  // `manual-review` is the seeded as-published baseline, not an editor act.
  if (event.result === 'accepted' && event.method !== 'manual-review') return 'verified';
  return null;
};

/*
 * Every code game an editor may act on, with its entries split into what is
 * settled and what is not. A retired game is excluded outright; a planned one
 * qualifies on the same terms the site indexes it on - at least one entry that
 * has not been retired.
 */
export const checkableGames = (operations) => {
  const newest = newestEventsByEntry(operations);
  const games = new Map();

  for (const game of operations.games) {
    if (game.surface !== 'codes') continue;
    if (game.publicationState === 'retired') continue;
    const entries = operations.codes.filter((entry) => entry.gameSlug === game.slug);
    const live = entries.filter((entry) => settled(newest.get(entry.id)) !== 'expired');
    if (game.publicationState !== 'published' && live.length === 0) continue;

    games.set(game.slug, {
      slug: game.slug,
      name: game.name,
      publicationState: game.publicationState,
      recheckTargetDays: game.recheckTargetDays,
      entries,
      outstanding: entries.filter((entry) => settled(newest.get(entry.id)) === null),
      /*
       * Every entry with the state it currently holds, for the re-check pass. The
       * first pass only ever needed what was outstanding; once the catalogue is
       * fully checked that list is empty and the work becomes re-checking what is
       * already recorded, which needs the whole list and each entry's standing.
       */
      all: entries.map((entry) => {
        const event = newest.get(entry.id);
        return {
          ...entry,
          state: settled(event) ?? 'listed',
          lastCheckedAt: event && event.method !== 'manual-review' ? event.checkedAt : null,
        };
      }),
      verified: entries.filter((entry) => settled(newest.get(entry.id)) === 'verified'),
      expired: entries.filter((entry) => settled(newest.get(entry.id)) === 'expired'),
      lastCheckedAt: entries
        .map((entry) => newest.get(entry.id))
        .filter((event) => event && event.method !== 'manual-review')
        .map((event) => event.checkedAt)
        .sort()
        .at(-1) ?? null,
    });
  }
  return games;
};

/*
 * Pages whose newest editor check is older than the game's own recheck target.
 *
 * `recheckTargetDays` has existed on every game since the operational content
 * was written and nothing has ever read it. It is a queue target and never a
 * state input - no page changes because a target passed, and this returns a
 * work list, not a status.
 */
export const dueForRecheck = (operations, now = Date.now()) => {
  const due = [];
  for (const game of checkableGames(operations).values()) {
    if (!game.lastCheckedAt) continue;
    const age = (now - Date.parse(game.lastCheckedAt)) / 86_400_000;
    if (age >= game.recheckTargetDays) due.push({ ...game, ageDays: age });
  }
  return due.sort((left, right) => (right.ageDays - right.recheckTargetDays) - (left.ageDays - left.recheckTargetDays));
};
