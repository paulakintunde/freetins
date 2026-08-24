import {
  formatAbsoluteTimestamp,
  getGameOperationalPage,
  operationalSummary,
  operations,
} from './operations';

const codeGames = operations.games.filter((game) => game.surface === 'codes');
const dailyLinkGames = operations.games.filter((game) => game.surface === 'daily');

const toCatalogueEntry = (game: (typeof operations.games)[number]) => {
  const page = getGameOperationalPage(game.slug);
  if (!page) throw new Error(`Missing operational page for ${game.slug}`);

  return {
    name: game.name,
    slug: game.slug,
    platform: game.platform,
    publicationState: game.publicationState,
    isPublished: page.isPublished,
    verifiedCount: page.verifiedCount,
    reportedCount: page.reportedCount,
    activeCount: page.verifiedCount + page.reportedCount,
    staleCount: page.staleCount,
    expiredCount: page.expiredCount,
    valueCount: page.values.length,
    updateCount: page.updates.length,
    latestCheckedAt: page.latestCheckedAt,
    checkedLabel: page.latestCheckedAt ? formatAbsoluteTimestamp(page.latestCheckedAt) : 'No verification recorded',
  };
};

export const gameCatalogue = codeGames.map(toCatalogueEntry);
export const publishedGameCatalogue = gameCatalogue.filter((game) => game.isPublished);
export const plannedGameCatalogue = gameCatalogue.filter((game) => !game.isPublished);

export const dailyLinkCatalogue = dailyLinkGames.map(toCatalogueEntry);
export const publishedDailyLinkCatalogue = dailyLinkCatalogue.filter((game) => game.isPublished);

const summary = operationalSummary();
const formatMedianAge = (milliseconds: number | null) => {
  if (milliseconds === null) return 'Not available';
  const minutes = Math.max(0, Math.round(milliseconds / 60_000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)} h`;
};

export const pulse = [
  { value: String(summary.publishedGames), label: 'operational game pages published' },
  { value: String(summary.checksToday), label: 'checks recorded today' },
  { value: formatMedianAge(summary.medianAgeMs), label: 'median verification age' },
  { value: summary.recentlyCheckedPercent === null ? 'Not available' : `${summary.recentlyCheckedPercent}%`, label: 'checked in the last hour' },
] as const;

export const homeTiles = publishedGameCatalogue
  .filter((game) => game.latestCheckedAt)
  .sort((left, right) => Date.parse(right.latestCheckedAt ?? '') - Date.parse(left.latestCheckedAt ?? ''))
  .slice(0, 12)
  .map((game) => ({ ...game, href: `/codes/${game.slug}/` }));

export const dailyGames = publishedDailyLinkCatalogue.map((game) => ({
  ...game,
  href: `/daily/${game.slug}/`,
}));
