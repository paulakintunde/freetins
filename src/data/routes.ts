import {
  dailyLinkCatalogue,
  gameCatalogue,
  publishedDailyLinkCatalogue,
  publishedGameCatalogue,
} from './home';
import { editorialArticles, getArticleByPath } from './articles';
import { authors } from './authors';
import { getCheatOperationalPage, getProduct, operations } from './operations';
import { codesTitle, dailyTitle, fitTitle } from '../lib/pageTitle';

export type RouteKind =
  | 'daily'
  | 'dailyGame'
  | 'browse'
  | 'codes'
  | 'cheats'
  | 'cheat'
  | 'search'
  | 'gearCategory'
  | 'gearProduct'
  | 'submit'
  | 'alerts'
  | 'author'
  | 'contact'
  | 'guide'
  | 'info'
  | 'az'
  | 'privacy'
  | 'affiliate'
  | 'values'
  | 'updates'
  | 'terms'
  | 'notTracked'
  | 'article';

export interface RouteDefinition {
  path: string;
  routeId: string;
  kind: RouteKind;
  title: string;
  heading: string;
  description: string;
  eyebrow?: string;
  name?: string;
  slug?: string;
  platform?: string;
  noindex?: boolean;
  /** False omits the rel=canonical link. Only the 404 template does this. */
  canonical?: boolean;
}

/*
 * Hub titles.
 *
 * These were the section name and the brand — "Blog | Freetins", fifteen
 * characters, of which eleven were the brand. A hub competes for the head term
 * of its whole section and was spending its title on a word from the nav bar.
 * Each one below leads with the term a reader would type and says what is
 * behind the link; a count is derived where a count is honest and omitted
 * where it would advertise an empty shelf. `fitTitle` holds the budget so the
 * hubs and the game pages cannot drift into two conventions.
 *
 * The three noindex hubs keep their short titles: /search/ is an internal
 * result surface, /submit/ and /alerts/ describe features that are not live.
 */
const publishedGameCount = publishedGameCatalogue.length;
const publishedPageCount = publishedGameCount + publishedDailyLinkCatalogue.length;

const staticRoutes: RouteDefinition[] = [
  {
    path: '/daily/', routeId: 'daily', kind: 'daily', title: fitTitle({ stem: 'Daily free reward links, dated row by row' }), heading: 'Daily links',
    description: 'Source-linked daily rewards with recorded dates and clear states.',
    noindex: publishedDailyLinkCatalogue.length + editorialArticles.filter((article) => article.section === 'daily').length === 0,
  },
  {
    path: '/codes/', routeId: 'browse', kind: 'browse', title: fitTitle({ stem: 'Game codes for Roblox', count: publishedGameCount > 0 ? `all ${publishedGameCount} games we list` : null }), heading: 'All codes',
    description: 'Published code pages backed by source URLs and redemption steps, with a state on every entry.',
    noindex: publishedGameCatalogue.length === 0,
  },
  {
    path: '/search/', routeId: 'search', kind: 'search', title: 'Search | Freetins', heading: 'Search',
    description: 'Search games, guides and daily-link pages on Freetins.',
    // Internal result pages stay out of the index. The directive has to be
    // crawlable to be obeyed, so robots.txt must not also block this path.
    noindex: true,
  },
  {
    path: '/cheats/', routeId: 'cheats', kind: 'cheats', title: fitTitle({ stem: 'Game cheats by platform, with warnings' }), heading: 'Cheats',
    description: 'Published cheat sheets with platform distinctions, warnings and cited sources.',
  },
  {
    path: '/answers/', routeId: 'answers', kind: 'info', title: fitTitle({ stem: 'Level answers, element recipes and puzzle solutions' }), heading: 'Answers',
    description: 'Level answers, element recipes and puzzle solutions, checked against the current build of the game so the numbering still matches what you see.',
  },
  {
    path: '/guides/', routeId: 'guideIndex', kind: 'info', title: fitTitle({ stem: 'Game guides: how each feature actually works' }), heading: 'Guides',
    description: 'Explainer and process pages: how a feature works, what is actually available, and what to do when the method everyone repeats does not work.',
  },
  {
    path: '/submit/', routeId: 'submit', kind: 'submit', title: 'Submit a code | Freetins', heading: 'Submit a code',
    description: 'Submission intake is not active yet. Use the published contact address for corrections.', eyebrow: 'Community', noindex: true,
  },
  {
    path: '/alerts/', routeId: 'alerts', kind: 'alerts', title: 'Code alerts | Freetins', heading: 'Know before the code expires',
    description: 'Alert delivery is not active yet. This page explains the launch requirement.', noindex: true,
  },
  {
    path: '/blog/', routeId: 'updates', kind: 'updates', title: fitTitle({ stem: 'How game codes and rewards actually work' }), heading: 'Blog',
    description: 'Longer pages on how codes and rewards actually work, each built from a dataset where every row carries its own evidence and state.',
  },
  {
    path: '/games/', routeId: 'az', kind: 'az', title: fitTitle({ stem: 'All games A-Z', count: publishedPageCount > 0 ? `every one of the ${publishedPageCount} we list` : null }), heading: 'All games A-Z',
    description: 'Every game with a published Freetins page, listed A to Z with the number of codes listed on it.',
    noindex: publishedGameCatalogue.length + publishedDailyLinkCatalogue.length === 0,
  },
];

const authorRoutes: RouteDefinition[] = authors.map((author) => ({
  path: author.path,
  routeId: 'author',
  kind: 'author',
  title: `${author.name}, ${author.role} | Freetins`,
  heading: author.name,
  description: author.credential,
  eyebrow: author.role,
  name: author.name,
  slug: author.slug,
}));

const cheatRoutes: RouteDefinition[] = operations.cheatGames.map((game) => {
  const page = getCheatOperationalPage(game.slug);
  const path = `/cheats/${game.slug}/`;
  const article = getArticleByPath(path);
  return {
    path,
    routeId: 'cheat',
    kind: 'cheat',
    title: `${game.heading} | Freetins`,
    heading: game.heading,
    description: article?.description ?? (page?.isPublished
      ? `${game.name} cheats with platform scope, source URLs and the state of every entry.`
      : `${game.name} has a cheat page configured, but no cheat is listed yet.`),
    name: game.name,
    slug: game.slug,
    noindex: !page?.isPublished && !article,
  };
});

const gearCategories = [
  ['roblox', 'Roblox gear'],
  ['mobile', 'Mobile gaming gear'],
  ['pc-and-console', 'PC and console gear'],
] as const;

const gearCategoryRoutes: RouteDefinition[] = gearCategories.map(([slug, name]) => ({
  path: `/gear/${slug}/`,
  routeId: 'gear',
  kind: 'gearCategory',
  title: `${name} | Freetins`,
  heading: name,
  description: `Source-linked ${name.toLowerCase()} research appears here when a checked product record is published.`,
  name,
  slug,
  noindex: !operations.products.some((product) => product.category === slug),
}));

const gearProductRoutes: RouteDefinition[] = ([
  ['roblox', 'roblox-gift-card-25-cad', 'Roblox gift card, 25 CAD'],
  ['pc-and-console', 'wired-gaming-headset-mid-range', 'Wired gaming headset, mid range'],
  ['mobile', 'controller-for-mobile-play', 'Controller for mobile play'],
  ['mobile', 'phone-cooling-clip', 'Phone cooling clip'],
  ['pc-and-console', 'mechanical-keypad-24-key', 'Mechanical keypad, 24 key'],
  ['pc-and-console', 'charging-dock-two-bay', 'Charging dock, two bay'],
] as const).map(([category, slug, name]) => ({
  path: `/gear/${category}/${slug}/`,
  routeId: 'gearItem',
  kind: 'gearProduct' as const,
  title: `${name} | Freetins`,
  heading: name,
  description: getProduct(slug)
    ? `Checked price, merchant source and editorial rationale for ${name.toLowerCase()}.`
    : `${name} is configured for product research, but no checked listing is published yet.`,
  name,
  slug,
  noindex: !getProduct(slug),
}));

const guideRoutes: RouteDefinition[] = ([
  ['every-mutation-and-what-triggers-it', 'Every mutation in Grow a Garden and what triggers it'],
  ['best-seeds-first-hour', 'Best seeds to plant in your first hour'],
  ['fastest-sheckle-farming-route', 'Fastest sheckle farming route'],
  ['sprinkler-placement-that-works', 'Sprinkler placement that actually works'],
  ['what-to-buy-first-from-the-gear-shop', 'What to buy first from the gear shop'],
  ['pet-setup-for-passive-income', 'Pet setup for passive income'],
] as const).map(([slug, heading]) => ({
  path: `/guides/${slug}/`,
  routeId: 'guide',
  kind: 'guide' as const,
  title: `${heading} | Freetins`,
  heading,
  description: `${heading} is configured for editorial review but is not published yet.`,
  name: 'Grow a Garden',
  slug,
  noindex: true,
}));

const generatedCheatPaths = new Set(cheatRoutes.map((route) => route.path));
const articleRoutes: RouteDefinition[] = editorialArticles
  .filter((article) => !generatedCheatPaths.has(article.path))
  .map((article) => ({
  path: article.path,
  routeId: article.routeId,
  kind: 'article',
  title: article.title,
  heading: article.heading,
  description: article.description,
  eyebrow: article.eyebrow,
  }));

const dailyRoutes: RouteDefinition[] = dailyLinkCatalogue.map((game) => ({
  path: `/daily/${game.slug}/`,
  routeId: 'freebies',
  kind: 'dailyGame',
  title: dailyTitle(game),
  heading: `${game.name} reward links`,
  description: game.isPublished
    ? `${game.name} reward links with source URLs and the date each was recorded.`
    : `${game.name} has a page configured, but no reward link is listed yet.`,
  name: game.name,
  slug: game.slug,
  noindex: !game.isPublished,
}));

/*
 * Only sections with published content get a route. Generating a values, archive
 * or updates page for a game that has none put 147 placeholder URLs in front of
 * crawlers, every one of them linked from the game tab bar.
 */
/**
 * The meta description for a game's code page.
 *
 * The line it replaces was one fixed sentence for every game, 76 to 97 characters
 * against the roughly 155 a result renders — so the largest section on the site
 * threw away a third of its snippet on all 53 pages, while the page below already
 * held the facts to fill it.
 *
 * It says only what the record says. Every clause is a count of rows or a feature
 * the page displays; none of them characterises a code as working, which is why the
 * count is `liveCount` reported as *listed* and why no clause claims a check
 * happened (CLAUDE.md; docs/adr/0003-no-hand-typed-verification-claims.md). It is
 * the same vocabulary `codesTitle` composes with, so the title and the snippet
 * under it cannot describe the page two different ways.
 */
const DESCRIPTION_BUDGET = 158;

const codesDescription = (game: (typeof gameCatalogue)[number]): string => {
  if (!game.isPublished) return `${game.name} has a page configured, but no code is listed yet.`;

  /*
   * A page can be published and still hold no rows. Describing "codes, each with
   * its source link" there would advertise rows that do not exist, which is the
   * one thing a description on this site may not do.
   */
  if (game.liveCount === 0) {
    return `${game.name} on ${game.platform}: no code is listed yet. The redemption path and the official source are recorded, and codes appear here as they are.`;
  }

  const core = `${game.name} on ${game.platform}: ${game.liveCount} codes listed, each with its source link, publication state and evidence line.`;

  /*
   * The archive clause is the one that can push a long game name past the budget,
   * so it is the one that gets dropped — the same shape as `fitTitle`, which sheds
   * its optional parts rather than truncating mid-word.
   */
  const full = game.expiredCount > 0
    ? `${core} Redemption steps, and ${game.expiredCount} expired codes kept on the page.`
    : `${core} Redemption steps included.`;

  return full.length <= DESCRIPTION_BUDGET ? full : `${core} Redemption steps included.`;
};

const gameRoutes: RouteDefinition[] = gameCatalogue.flatMap((game) => {
  const root = `/codes/${game.slug}`;
  const shared = { name: game.name, slug: game.slug, platform: game.platform };

  const routes: RouteDefinition[] = [
    {
      ...shared,
      path: `${root}/`,
      routeId: 'codes',
      kind: 'codes' as const,
      title: codesTitle(game),
      /*
       * The heading carries the head term too. A title that has just gained a
       * count and a month over an h1 reading "Grow a Garden" is the standard
       * trigger for Google discarding the title and writing its own from the
       * page, which would throw away the derivation above. They move together.
       */
      heading: `${game.name} codes`,
      description: codesDescription(game),
      noindex: !game.isPublished,
    },
  ];

  if (game.valueCount > 0) {
    routes.push({
      ...shared,
      path: `${root}/values/`,
      routeId: 'values',
      kind: 'values' as const,
      title: `${game.name} item values | Freetins`,
      heading: 'Item values',
      description: `${game.name} item values with a source and observation time on every row.`,
    });
  }

  if (game.updateCount > 0) {
    routes.push({
      ...shared,
      path: `${root}/updates/`,
      routeId: 'updates',
      kind: 'updates' as const,
      title: `${game.name} updates | Freetins`,
      heading: 'Updates',
      description: `Source-linked update history for ${game.name}.`,
    });
  }

  return routes;
});

export const routeDefinitions: RouteDefinition[] = [
  ...staticRoutes,
  ...dailyRoutes,
  ...gameRoutes,
  ...cheatRoutes,
  ...authorRoutes,
  ...guideRoutes,
  ...articleRoutes,
  ...gearCategoryRoutes,
  ...gearProductRoutes,
];

export const prerenderedRouteDefinitions = routeDefinitions;

export const getRouteDefinition = (path: string) => {
  const definition = routeDefinitions.find((candidate) => candidate.path === path);
  if (!definition) throw new Error(`Missing route definition for ${path}`);
  return definition;
};

export const notFoundDefinition: RouteDefinition = {
  // Trailing slash like every other route, so the breadcrumb items match the URL.
  path: '/404/',
  routeId: 'notfound',
  kind: 'notTracked',
  title: 'Page not found | Freetins',
  heading: 'Nothing grows here',
  description: 'The address does not match a page tracked by Freetins.',
  /*
   * The body Cloudflare serves with a 404 is also emitted as a real document at
   * /404/, where it answers 200 like any other page. Without this it invited
   * indexing: a page whose entire content is "nothing here", eligible to rank and
   * to be counted against the site as a soft 404. The status code is what a
   * crawler acts on at the missing URL; this covers the document itself.
   *
   * No canonical either. The same body is served at every missing URL, and a
   * canonical on it nominates /404/ as the preferred version of an address that
   * does not exist; a noindex page pointing a canonical at itself is a
   * contradiction a crawler has to resolve on its own.
   */
  noindex: true,
  canonical: false,
};
