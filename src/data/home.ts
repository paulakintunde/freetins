import {
  formatAbsoluteTimestamp,
  getGameOperationalPage,
  operationalSummary,
  operations,
} from './operations';

const codeGames = operations.games.filter((game) => game.surface === 'codes');
const dailyLinkGames = operations.games.filter((game) => game.surface === 'daily');

const newestOf = (values: string[]) => values
  .filter((value) => !Number.isNaN(Date.parse(value)))
  .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;

const toCatalogueEntry = (game: (typeof operations.games)[number]) => {
  const page = getGameOperationalPage(game.slug);
  if (!page) throw new Error(`Missing operational page for ${game.slug}`);

  return {
    name: game.name,
    slug: game.slug,
    platform: game.platform,
    /* Carries the game's own listing id, which is how a dataset page is matched to it. */
    officialSourceUrl: game.officialSourceUrl,
    publicationState: game.publicationState,
    isPublished: page.isPublished,
    verifiedCount: page.verifiedCount,
    /* An editor's star plus the as-published baseline. Zero on every operational page today. */
    activeCount: page.verifiedCount + page.activeCount,
    listedCount: page.listedCount,
    liveCount: page.liveCount,
    expiredCount: page.expiredCount,
    valueCount: page.values.length,
    updateCount: page.updates.length,
    latestCheckedAt: page.latestCheckedAt,
    /* When the newest entry was first seen; the sort key for a page with no event yet. */
    newestEntryAt: newestOf(page.entries.map((item) => item.entry.firstSeenAt)),
    checkedLabel: page.latestCheckedAt ? formatAbsoluteTimestamp(page.latestCheckedAt) : 'Awaiting editor verification',
  };
};

export const gameCatalogue = codeGames.map(toCatalogueEntry);
export const publishedGameCatalogue = gameCatalogue.filter((game) => game.isPublished);
export const plannedGameCatalogue = gameCatalogue.filter((game) => !game.isPublished);

export const dailyLinkCatalogue = dailyLinkGames.map(toCatalogueEntry);
export const publishedDailyLinkCatalogue = dailyLinkCatalogue.filter((game) => game.isPublished);

const summary = operationalSummary();

/*
 * Four figures that count records and nothing that decays. A median age or a
 * "checked in the last hour" percentage is a timer read out loud, and every one of
 * them was zero or stale on every build.
 */
export const pulse = [
  { value: String(summary.publishedGames), label: 'game pages published' },
  { value: String(summary.listedCount), label: 'codes listed, awaiting editor verification' },
  { value: String(summary.verifiedCount), label: 'codes verified by an editor' },
  { value: String(summary.expiredCount), label: 'expired codes kept on record' },
] as const;

/*
 * Every published page is a candidate. Filtering on a recorded event would hide a
 * page whose entries are all Listed, which is hiding for want of verification.
 * Pages with an event sort by that date; the rest by their newest entry, and a
 * page with neither sorts last rather than returning NaN to a comparator. Shared
 * with the sibling-game links so both surfaces order pages the same way.
 */
export const recordedAt = (game: { latestCheckedAt: string | null; newestEntryAt: string | null }) =>
  Date.parse(game.latestCheckedAt ?? game.newestEntryAt ?? '') || 0;

export const homeTiles = publishedGameCatalogue
  .sort((left, right) => recordedAt(right) - recordedAt(left))
  .slice(0, 12)
  .map((game) => ({ ...game, href: `/codes/${game.slug}/` }));

export const dailyGames = publishedDailyLinkCatalogue.map((game) => ({
  ...game,
  href: `/daily/${game.slug}/`,
}));
