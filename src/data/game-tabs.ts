import { editorialArticles } from './articles';
import { gameCatalogue } from './home';

/**
 * Which sections a single game actually has content for.
 *
 * A game page used to advertise Codes, Values, Archive and Updates unconditionally,
 * and `routes.ts` generated a route for each one. With no value rows, no update
 * entries and no expired codes on most games, that produced 147 routes whose only
 * content was an "is configured but not published" placeholder — all of them linked
 * from the tab bar, so crawlers reached every one.
 *
 * Tabs are now derived from published content. A section with nothing in it is not
 * linked and its route is never generated, so there is no thin page to crawl.
 *
 * Expired codes no longer get a tab or a route. They are a maintenance record, not
 * a search destination, and they now render inside the game's own page.
 */
export type GameTabId = 'codes' | 'values' | 'answers' | 'updates';

export interface GameTab {
  id: GameTabId;
  label: string;
  href: string;
}

export type GameCatalogueEntry = (typeof gameCatalogue)[number];

/**
 * Answer sheets are editorial, not operational, so they are matched by an explicit
 * `gameSlug` on the article rather than inferred from a path. No code game carries
 * an answer sheet today: the code catalogue is Roblox-style code redemption and the
 * answers section covers puzzle titles such as Little Alchemy. The lookup exists so
 * that adding `gameSlug` to an answers article surfaces the tab automatically.
 */
const answerArticleFor = (slug: string) => editorialArticles.find(
  (article) => article.section === 'answers' && article.gameSlug === slug,
);

export const gameTabsFor = (game: GameCatalogueEntry): GameTab[] => {
  const root = `/codes/${game.slug}/`;
  const answers = answerArticleFor(game.slug);

  const tabs: Array<GameTab | null> = [
    // The codes route is the game's own page and always exists.
    { id: 'codes', label: 'Codes', href: root },
    game.valueCount > 0 ? { id: 'values', label: 'Values', href: `${root}values/` } : null,
    answers ? { id: 'answers', label: 'Answers', href: answers.path } : null,
    game.updateCount > 0 ? { id: 'updates', label: 'Updates', href: `${root}updates/` } : null,
  ];

  return tabs.filter((tab): tab is GameTab => tab !== null);
};

export const gameTabsBySlug = new Map(
  gameCatalogue.map((game) => [game.slug, gameTabsFor(game)] as const),
);

export const hasGameTab = (slug: string, id: GameTabId) =>
  (gameTabsBySlug.get(slug) ?? []).some((tab) => tab.id === id);

/** Only meaningful for a game whose tab bar has somewhere else to go. */
export const gameTabsForSlug = (slug: string) => {
  const tabs = gameTabsBySlug.get(slug) ?? [];
  return tabs.length > 1 ? tabs : [];
};
