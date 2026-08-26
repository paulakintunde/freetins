import { editorialArticles, type EditorialArticle } from './articles';
import { publishedGameCatalogue, recordedAt } from './home';

/**
 * Contextual links between pages that are actually related.
 *
 * Before this, the editorial half of the site (answers, guides, cheats) and the
 * operational half (game code pages) had no links between them in either
 * direction: 41 curated `related` links across 19 articles, none pointing at a
 * code page, and code pages carrying no related links at all.
 *
 * Every relationship here is derived from something real — a shared platform, a
 * shared section, or an explicit `gameSlug` on an article. Nothing is filled in
 * just to reach a link count, because a related-links row of arbitrary games is
 * worse than an empty one.
 */
export interface RelatedLink {
  label: string;
  href: string;
  description?: string;
}

/* Matching lives in lib so it is testable without the site data graph. */
export { datasetLinksForGame } from '../lib/datasetLinks';

const SIBLING_LIMIT = 4;

/*
 * Most recently recorded first, on the same key the home tiles use: the newest
 * event, else the newest entry, else zero. A published game with no event is a
 * normal state now, and a comparator that returned NaN for it would leave the
 * order to the sort's mood.
 */
const byMostRecentlyChecked = (
  left: { latestCheckedAt: string | null; newestEntryAt: string | null },
  right: { latestCheckedAt: string | null; newestEntryAt: string | null },
) => recordedAt(right) - recordedAt(left);

/** "N listed codes · recorded <date>", or the awaiting label when no event exists. */
const recordDescription = (entry: { liveCount: number; latestCheckedAt: string | null; checkedLabel: string }) =>
  `${entry.liveCount} listed ${entry.liveCount === 1 ? 'code' : 'codes'} · ${entry.latestCheckedAt ? `recorded ${entry.checkedLabel}` : entry.checkedLabel}`;

/** Published games on the same platform, most recently recorded first. */
export const siblingGamesFor = (slug: string): RelatedLink[] => {
  const game = publishedGameCatalogue.find((entry) => entry.slug === slug);
  if (!game) return [];

  return publishedGameCatalogue
    .filter((entry) => entry.slug !== slug && entry.platform === game.platform)
    .sort(byMostRecentlyChecked)
    .slice(0, SIBLING_LIMIT)
    .map((entry) => ({
      label: entry.name,
      href: `/codes/${entry.slug}/`,
      description: recordDescription(entry),
    }));
};

/** Editorial pages that name this game explicitly. */
export const articlesForGame = (slug: string): RelatedLink[] => editorialArticles
  .filter((article) => article.gameSlug === slug)
  .map((article) => ({
    label: article.heading,
    href: article.path,
    description: article.description,
  }));

/** The code page for the game an article is about, when one is published. */
export const gamePageForArticle = (article: EditorialArticle): RelatedLink[] => {
  if (!article.gameSlug) return [];
  const game = publishedGameCatalogue.find((entry) => entry.slug === article.gameSlug);
  if (!game) return [];

  return [{
    label: `${game.name} codes`,
    href: `/codes/${game.slug}/`,
    description: recordDescription(game),
  }];
};

/**
 * Other pages in the same editorial section, used to top up a curated list
 * rather than replace it. Anything the article already links to is skipped so
 * the row never repeats a link that appears above it.
 */
export const siblingArticlesFor = (article: EditorialArticle, limit = 3): RelatedLink[] => {
  const alreadyLinked = new Set(article.related.map((link) => link.href));

  return editorialArticles
    .filter((candidate) => candidate.section === article.section
      && candidate.path !== article.path
      && !alreadyLinked.has(candidate.path))
    .slice(0, limit)
    .map((candidate) => ({ label: candidate.heading, href: candidate.path }));
};

/**
 * The full related set for a game code page: its editorial coverage first, then
 * other games a reader of this one is plausibly looking for.
 */
export const gameRelatedLinks = (slug: string): RelatedLink[] => [
  ...articlesForGame(slug),
  ...siblingGamesFor(slug),
];
