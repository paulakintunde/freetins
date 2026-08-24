import { editorialArticles } from './articles';
import { publishedDailyLinkCatalogue, publishedGameCatalogue } from './home';
import { getCheatOperationalPage, operations } from './operations';
import { validateSearchIndex, type SearchGroup, type SearchRecord } from '../lib/search';

/**
 * The search index only carries pages a reader can actually use: published
 * operational pages and published editorial pages. Configured drafts stay out,
 * which matches the promise printed on the search page itself.
 */

const articleGroups: Record<(typeof editorialArticles)[number]['section'], SearchGroup> = {
  answers: 'Answers',
  guides: 'Guides',
  resources: 'Resources',
  cheats: 'Cheats',
  daily: 'Daily links',
  legal: 'Site',
  about: 'Site',
};

const slugWords = (slug: string) => slug.split('-');

const codeRecords: SearchRecord[] = publishedGameCatalogue.map((game) => ({
  path: `/codes/${game.slug}/`,
  title: `${game.name} codes`,
  group: 'Codes',
  description: `Working ${game.name} codes with source URLs, redemption steps and recorded checks. ${game.checkedLabel}.`,
  keywords: [game.name, game.platform, ...slugWords(game.slug), 'codes', 'promo codes', 'redeem', 'free rewards'],
}));

const valueRecords: SearchRecord[] = publishedGameCatalogue
  .filter((game) => game.valueCount > 0)
  .map((game) => ({
    path: `/codes/${game.slug}/values/`,
    title: `${game.name} item values`,
    group: 'Item values',
    description: `${game.valueCount} sourced ${game.name} item values, each with an observation time.`,
    keywords: [game.name, ...slugWords(game.slug), 'values', 'value list', 'worth', 'trading', 'prices'],
  }));

const dailyRecords: SearchRecord[] = publishedDailyLinkCatalogue.map((game) => ({
  path: `/daily/${game.slug}/`,
  title: `${game.name} reward links`,
  group: 'Daily links',
  description: `${game.name} daily reward links with source URLs and recorded check times. ${game.checkedLabel}.`,
  keywords: [game.name, game.platform, ...slugWords(game.slug), 'daily', 'free spins', 'reward links', 'links'],
}));

const cheatRecords: SearchRecord[] = operations.cheatGames
  .filter((game) => getCheatOperationalPage(game.slug)?.isPublished)
  .map((game) => ({
    path: `/cheats/${game.slug}/`,
    title: game.heading,
    group: 'Cheats',
    description: `${game.name} cheats with platform scope, cited sources and recorded verification events.`,
    keywords: [game.name, ...game.platforms, ...slugWords(game.slug), 'cheats', 'cheat codes', 'unlockables'],
  }));

const articleRecords: SearchRecord[] = editorialArticles.map((article) => ({
  path: article.path,
  title: article.heading,
  group: articleGroups[article.section],
  description: article.description,
  keywords: [
    article.eyebrow,
    article.section,
    ...article.sections.map((section) => section.heading),
    ...slugWords(article.path.replaceAll('/', '-')),
  ].filter((keyword) => keyword.length > 0),
}));

const hubRecords: SearchRecord[] = [
  {
    path: '/codes/',
    title: 'All game codes',
    group: 'Site',
    description: 'Every published code page backed by source URLs and recorded verification events.',
    keywords: ['codes', 'all codes', 'browse', 'game codes', 'index'],
  },
  {
    path: '/daily/',
    title: 'Daily links',
    group: 'Site',
    description: 'Source-linked daily rewards with absolute check times and clear verification states.',
    keywords: ['daily', 'daily links', 'free links', 'rewards', 'browse'],
  },
  {
    path: '/cheats/',
    title: 'Game cheats',
    group: 'Site',
    description: 'Published cheat sheets with platform distinctions, warnings and cited sources.',
    keywords: ['cheats', 'cheat codes', 'browse'],
  },
  {
    path: '/answers/',
    title: 'Answers',
    group: 'Site',
    description: 'Puzzle and level answer sheets with direct navigation.',
    keywords: ['answers', 'solutions', 'levels', 'puzzles', 'browse'],
  },
  {
    path: '/guides/',
    title: 'Guides',
    group: 'Site',
    description: 'Process and explainer pages that are not one game’s codes.',
    keywords: ['guides', 'how to', 'explainer', 'browse'],
  },
  {
    path: '/games/',
    title: 'All games A-Z',
    group: 'Site',
    description: 'Every published game page backed by operational content records.',
    keywords: ['games', 'a-z', 'all games', 'list', 'browse', 'index'],
  },
  {
    path: '/how-we-verify/',
    title: 'How we verify',
    group: 'Site',
    description: 'The evidence states, source requirements, freshness windows and removal rules used by Freetins.',
    keywords: ['verify', 'verification', 'evidence', 'sources', 'editorial policy', 'trust'],
  },
];

const deduplicate = (records: readonly SearchRecord[]) => {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.path)) return false;
    seen.add(record.path);
    return true;
  });
};

export const searchIndex: SearchRecord[] = validateSearchIndex(deduplicate([
  ...codeRecords,
  ...dailyRecords,
  ...cheatRecords,
  ...articleRecords,
  ...valueRecords,
  ...hubRecords,
]));
