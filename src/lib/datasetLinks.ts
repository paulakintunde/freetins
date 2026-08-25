/*
 * Which dataset-backed pages belong on a game's code page.
 *
 * Pure matching logic, kept out of data/interlinks.ts so it can be tested
 * without loading the site data graph. interlinks.ts re-exports it as the
 * composition point for code pages.
 */

import type { DatasetPageSummary } from './datasetPages';
import type { RelatedLink } from '../data/interlinks';

const DATASET_LIMIT = 3;

/**
 * Hosts that mark a dataset page as being about a platform's own redemption
 * mechanism rather than about one game. Roblox is the only entry because every
 * published code page is a Roblox game; a second platform means a second host,
 * not a second rule.
 */
const PLATFORM_HOSTS: Record<string, string> = { Roblox: 'roblox.com' };

/**
 * The listing id inside a game's official source URL. A dataset page about that
 * game states the same id as its entity, which is what makes the match a fact
 * about the subject rather than an inference from a similar slug.
 */
const listingIdFrom = (url: string | null): string | null =>
  /\/games\/(\d+)/.exec(url ?? '')?.[1] ?? null;

const hostOf = (value: string): string | null => {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};

/**
 * A short, factual line for a dataset page's card.
 *
 * Deliberately not the page's unverified summary: that is a multi-sentence
 * caveat written to be read on the page itself, and it runs to hundreds of
 * characters. Row counts say what the reader is about to get in the same shape
 * the sibling game cards already use.
 */
const datasetCardDescription = (page: DatasetPageSummary): string => {
  const entries = `${page.totalCount} ${page.totalCount === 1 ? 'entry' : 'entries'}`;
  return page.activeCount > 0 ? `${entries} · ${page.activeCount} active` : entries;
};

/**
 * Dataset-backed pages worth showing on a game's code page.
 *
 * Two relationships qualify, in this order. A page whose entity is this game's
 * listing id is about this game, so it comes first. A page whose entity is a URL
 * on the platform's own host is about how codes work on that platform, which a
 * reader of any game on it is plausibly after.
 *
 * Nothing else qualifies. A page about another game is not related just because
 * both are Roblox, and the module's rule holds: an arbitrary row of links is
 * worse than an empty one.
 */
export const datasetLinksForGame = (
  game: { platform: string; officialSourceUrl: string | null },
  pages: DatasetPageSummary[],
): RelatedLink[] => {
  const listingId = listingIdFrom(game.officialSourceUrl);
  const platformHost = PLATFORM_HOSTS[game.platform];

  const aboutThisGame = listingId === null
    ? []
    : pages.filter((page) => page.entityId === listingId);

  const aboutThePlatform = platformHost === undefined ? [] : pages.filter((page) => {
    const host = hostOf(page.entityId);
    return host !== null && (host === platformHost || host.endsWith(`.${platformHost}`));
  });

  const seen = new Set<string>();
  return [...aboutThisGame, ...aboutThePlatform]
    .filter((page) => {
      if (seen.has(page.path)) return false;
      seen.add(page.path);
      return true;
    })
    .slice(0, DATASET_LIMIT)
    .map((page) => ({
      label: page.heading,
      href: page.path,
      description: datasetCardDescription(page),
    }));
};

