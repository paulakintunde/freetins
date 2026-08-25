import rawOperations from '../content/operations.json' with { type: 'json' };

export type OperationalSurface = 'codes' | 'daily';
export type PublicationState = 'planned' | 'published' | 'retired';
export type EntryType = 'code' | 'dailyLink' | 'cheat';
export type VerificationResult = 'accepted' | 'rejected' | 'source-only' | 'unreachable';
export type VerificationMethod = 'redeemed' | 'opened' | 'entered' | 'official-source' | 'manual-review';
export type EntryState = 'verified' | 'reported' | 'stale' | 'expired' | 'unverified';

/**
 * A channel the game's publisher controls and posts codes on. This is the only
 * class of URL that counts as evidence a code was issued.
 *
 * A store or catalogue listing is deliberately not in this union. A Roblox game
 * page proves the game exists; it never proves a code was announced, so it cannot
 * be cited as a code source.
 */
export type PublisherChannelType = 'website' | 'youtube' | 'discord' | 'twitch' | 'x' | 'twitter';

export interface PublisherChannel {
  type: PublisherChannelType;
  url: string;
  label: string;
}

export interface OperationalGame {
  slug: string;
  name: string;
  surface: OperationalSurface;
  platform: string;
  publicationState: PublicationState;
  verificationWindowHours: number;
  /** The game's own listing. Used to link the game, never to source a code. */
  officialSourceUrl: string | null;
  /** Channels the publisher posts codes on. Empty means no code here can be confirmed. */
  publisherChannels?: PublisherChannel[];
  redeemSteps: string[];
}

export interface CodeEntry {
  id: string;
  gameSlug: string;
  code: string;
  reward: string;
  firstSeenAt: string;
  /**
   * The publisher-channel URL where this code was announced. This is the citation
   * the page shows. Null means nobody has found a publisher post for it yet, which
   * caps the entry at community-reported no matter how many blogs repeat it.
   */
  publisherSourceUrl?: string | null;
  /**
   * Where the code was first noticed. Aggregator blogs live here. Kept for the
   * audit trail and never presented to the reader as evidence, because one
   * aggregator repeating another is not corroboration.
   */
  discoveredVia?: string[];
  sourceUrls: string[];
}

export interface DailyLinkEntry {
  id: string;
  gameSlug: string;
  label: string;
  url: string;
  firstSeenAt: string;
  /** Publisher-channel URL where this was announced. See CodeEntry. */
  publisherSourceUrl?: string | null;
  /** Where it was first noticed. Never shown as evidence. */
  discoveredVia?: string[];
  sourceUrls: string[];
}

export interface CheatGame {
  slug: string;
  name: string;
  heading: string;
  platforms: string[];
  publicationState: PublicationState;
  confirmedBuild: string | null;
  sourceUrls: string[];
}

export interface CheatEntry {
  id: string;
  gameSlug: string;
  name: string;
  input: string;
  platforms: string[];
  warning: string | null;
  sourceUrls: string[];
}

export interface ValueEntry {
  id: string;
  gameSlug: string;
  item: string;
  tier: string;
  value: string;
  observedAt: string;
  sourceUrl: string;
}

export interface UpdateEntry {
  id: string;
  gameSlug: string;
  version: string;
  title: string;
  summary: string;
  publishedAt: string;
  sourceUrl: string;
}

export interface ProductEntry {
  id: string;
  category: 'roblox' | 'mobile' | 'pc-and-console';
  slug: string;
  name: string;
  price: string;
  currency: string;
  checkedAt: string;
  merchantUrl: string;
  disclosure: string;
}

export interface SponsorshipEntry {
  id: string;
  title: string;
  label: string;
  targetUrl: string;
  startsAt: string;
  endsAt: string;
  disclosure: string;
}

export interface ServiceConfiguration {
  checker: { enabled: boolean; scheduleMinutes: number | null };
  alerts: { enabled: boolean; channels: Array<'email' | 'discord'>; subscriptionEndpoint: string | null };
  advertising: { enabled: boolean; provider: string | null; privacyPolicyUrl: string | null; placementIds: string[] };
}

export interface VerificationEvent {
  id: string;
  entryType: EntryType;
  entryId: string;
  checkedAt: string;
  result: VerificationResult;
  method: VerificationMethod;
  checkedBy: string;
}

export interface OperationalData {
  schemaVersion: number;
  games: OperationalGame[];
  codes: CodeEntry[];
  dailyLinks: DailyLinkEntry[];
  cheatGames: CheatGame[];
  cheats: CheatEntry[];
  values: ValueEntry[];
  updates: UpdateEntry[];
  products: ProductEntry[];
  sponsorships: SponsorshipEntry[];
  services: ServiceConfiguration;
  verificationEvents: VerificationEvent[];
}

/**
 * How well an entry is sourced. Orthogonal to `EntryState`: state answers "did the
 * last check pass", tier answers "do we know the publisher ever issued this". A
 * redeemed code is verified whatever the paper trail, and a code reposted by fifty
 * blogs is still community-reported.
 */
export type EvidenceTier = 'publisher-confirmed' | 'community-reported';

export interface ResolvedEntry<T> {
  entry: T;
  latestEvent: VerificationEvent | null;
  state: EntryState;
  tier: EvidenceTier;
}

export const evidenceTierOf = (entry: { publisherSourceUrl?: string | null }): EvidenceTier =>
  entry.publisherSourceUrl ? 'publisher-confirmed' : 'community-reported';

export interface EntryCitation {
  url: string;
  label: string;
  tier: EvidenceTier;
}

/**
 * The citation a row shows the reader.
 *
 * `publisherSourceUrl` is the strong form and remains the only thing that reads as
 * publisher-confirmed. When there is none the entry still carries the outlet that
 * reported it in `sourceUrls`, and the page used to discard that and print
 * "no publisher post found" instead. That told the reader less than the data holds:
 * a row that is merely uncorroborated read as one nobody could find a source for.
 * Naming the outlet keeps the tier distinction intact and stops the page disclaiming
 * evidence it is holding.
 *
 * `discoveredVia` is deliberately not consulted. An aggregator repeating another
 * aggregator is not corroboration, and surfacing it here would launder it into one.
 */
export const citationFor = (
  entry: { publisherSourceUrl?: string | null; sourceUrls?: string[] },
): EntryCitation | null => {
  if (entry.publisherSourceUrl) {
    return { url: entry.publisherSourceUrl, label: 'Publisher post', tier: 'publisher-confirmed' };
  }
  const reported = (entry.sourceUrls ?? []).find((url) => isHttpsUrl(url));
  if (!reported) return null;
  const host = hostOf(reported);
  return {
    url: reported,
    label: host ? `Reported by ${host}` : 'Reported by one outlet',
    tier: 'community-reported',
  };
};

/**
 * A code a reader can act on right now: the last check did not reject it and it has
 * not aged out of its freshness window. Expired, stale and never-checked entries are
 * all excluded, which is what makes the count on a game page mean something.
 */
export const isUsableState = (state: EntryState) => state === 'verified' || state === 'reported';

/**
 * Whether a game's page holds enough live, checked content to deserve an index entry.
 *
 * `publicationState` used to decide this on its own, which made indexing a flag
 * somebody had to remember to flip. The three highest-intent daily-link pages —
 * Monopoly GO, Coin Master, Dice Dreams — sat `planned` and therefore noindexed
 * with no defect anywhere in the data: nothing was wrong, nobody had thrown the
 * switch. That is the wrong failure mode for the most valuable pages on the site.
 *
 * So `planned` now means "waiting on data" rather than "switched off", and the page
 * indexes itself the moment the data arrives. It cannot index empty: readiness needs
 * a link a reader can act on right now, which means a verification event inside the
 * game's own window, plus the furniture that makes the page answer its query.
 *
 * `published` is left exactly as it was. Deriving it for those pages too would mean
 * a game whose codes all aged out overnight silently dropped out of the index, and
 * a 14-page deindex is not a change to make as a side effect of this one. `retired`
 * stays out regardless, which is the whole point of retiring something.
 */
export const isIndexable = (
  game: Pick<OperationalGame, 'publicationState' | 'officialSourceUrl' | 'redeemSteps'>,
  entries: ResolvedEntry<CodeEntry | DailyLinkEntry | CheatEntry>[],
): boolean => {
  if (game.publicationState === 'retired') return false;
  if (game.publicationState === 'published') return true;
  return Boolean(game.officialSourceUrl)
    && game.redeemSteps.length >= 2
    && entries.some((item) => isUsableState(item.state));
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

/**
 * Hosts that publish anyone's build under a throwaway name. A citation pointing at
 * one of these is not a publisher, and letting one through is how
 * `basketball-zero-codes.pages.dev` ended up cited as evidence for a code.
 */
const previewHosts = ['pages.dev', 'vercel.app', 'netlify.app', 'netlify.com', 'workers.dev', 'github.io'];

const isPreviewHost = (hostname: string) =>
  previewHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));

const isHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname !== 'example.com'
      && !url.hostname.endsWith('.example.com')
      && !isPreviewHost(url.hostname);
  } catch {
    return false;
  }
};

const hostOf = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const isIsoTimestamp = (value: string) => isoPattern.test(value) && !Number.isNaN(Date.parse(value));

const requireUnique = (values: string[], label: string, errors: string[]) => {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length > 0) errors.push(`${label} contains duplicate values: ${[...new Set(duplicates)].join(', ')}`);
};

export const validateOperations = (candidate: OperationalData) => {
  const errors: string[] = [];
  if (candidate.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  requireUnique(candidate.games.map((game) => game.slug), 'games.slug', errors);
  requireUnique(candidate.codes.map((entry) => entry.id), 'codes.id', errors);
  requireUnique(candidate.dailyLinks.map((entry) => entry.id), 'dailyLinks.id', errors);
  requireUnique(candidate.cheatGames.map((game) => game.slug), 'cheatGames.slug', errors);
  requireUnique(candidate.cheats.map((entry) => entry.id), 'cheats.id', errors);
  requireUnique(candidate.values.map((entry) => entry.id), 'values.id', errors);
  requireUnique(candidate.updates.map((entry) => entry.id), 'updates.id', errors);
  requireUnique(candidate.products.map((entry) => entry.id), 'products.id', errors);
  requireUnique(candidate.sponsorships.map((entry) => entry.id), 'sponsorships.id', errors);
  requireUnique(candidate.verificationEvents.map((event) => event.id), 'verificationEvents.id', errors);

  const gamesBySlug = new Map(candidate.games.map((game) => [game.slug, game]));
  for (const game of candidate.games) {
    if (!slugPattern.test(game.slug)) errors.push(`Game slug is invalid: ${game.slug}`);
    if (!game.name.trim()) errors.push(`Game ${game.slug} is missing a name`);
    if (!['codes', 'daily'].includes(game.surface)) errors.push(`Game ${game.slug} has an invalid surface`);
    if (!['planned', 'published', 'retired'].includes(game.publicationState)) errors.push(`Game ${game.slug} has an invalid publicationState`);
    if (!Number.isFinite(game.verificationWindowHours) || game.verificationWindowHours <= 0) errors.push(`Game ${game.slug} needs a positive verificationWindowHours`);
    if (game.officialSourceUrl !== null && !isHttpsUrl(game.officialSourceUrl)) errors.push(`Game ${game.slug} has an invalid officialSourceUrl`);
    for (const channel of game.publisherChannels ?? []) {
      if (!isHttpsUrl(channel.url)) errors.push(`Game ${game.slug} has an invalid publisher channel URL`);
      if (!channel.label.trim()) errors.push(`Game ${game.slug} has a publisher channel with no label`);
    }
    if (game.publicationState === 'published') {
      if (!game.officialSourceUrl) errors.push(`Published game ${game.slug} needs an officialSourceUrl`);
      if (game.redeemSteps.length < 2) errors.push(`Published game ${game.slug} needs at least two redeemSteps`);
    }
  }

  const validateEntry = (entry: CodeEntry | DailyLinkEntry, expectedSurface: OperationalSurface) => {
    const game = gamesBySlug.get(entry.gameSlug);
    if (!game) errors.push(`Entry ${entry.id} references unknown game ${entry.gameSlug}`);
    else if (game.surface !== expectedSurface) errors.push(`Entry ${entry.id} does not match the ${game.surface} surface`);
    if (!isIsoTimestamp(entry.firstSeenAt)) errors.push(`Entry ${entry.id} has an invalid firstSeenAt`);
    if (entry.sourceUrls.length === 0 || entry.sourceUrls.some((url) => !isHttpsUrl(url))) errors.push(`Entry ${entry.id} needs valid HTTPS sourceUrls`);
    for (const url of entry.discoveredVia ?? []) {
      if (!isHttpsUrl(url)) errors.push(`Entry ${entry.id} has an invalid discoveredVia URL`);
    }
    /*
     * A citation only counts if it sits on a channel the publisher controls. Checking
     * it against the game's declared channels means an aggregator URL cannot be
     * promoted to evidence by relabelling the field.
     */
    if (entry.publisherSourceUrl) {
      if (!isHttpsUrl(entry.publisherSourceUrl)) {
        errors.push(`Entry ${entry.id} has an invalid publisherSourceUrl`);
      } else if (game) {
        const channels = (game.publisherChannels ?? []).map((channel) => hostOf(channel.url));
        const cited = hostOf(entry.publisherSourceUrl);
        if (channels.length === 0) {
          errors.push(`Entry ${entry.id} cites a publisher source but ${game.slug} declares no publisherChannels`);
        } else if (!cited || !channels.includes(cited)) {
          errors.push(`Entry ${entry.id} cites ${cited ?? 'an unreadable host'}, which is not a declared publisher channel for ${game.slug}`);
        }
      }
    }
  };

  candidate.codes.forEach((entry) => {
    validateEntry(entry, 'codes');
    if (!entry.code.trim() || !entry.reward.trim()) errors.push(`Code ${entry.id} needs a code and reward`);
  });
  candidate.dailyLinks.forEach((entry) => {
    validateEntry(entry, 'daily');
    if (!entry.label.trim() || !isHttpsUrl(entry.url)) errors.push(`Daily link ${entry.id} needs a label and real HTTPS URL`);
  });

  const cheatGamesBySlug = new Map(candidate.cheatGames.map((game) => [game.slug, game]));
  for (const game of candidate.cheatGames) {
    if (!slugPattern.test(game.slug) || !game.name.trim() || !game.heading.trim()) errors.push(`Cheat game ${game.slug} needs a valid slug, name and heading`);
    if (!['planned', 'published', 'retired'].includes(game.publicationState)) errors.push(`Cheat game ${game.slug} has an invalid publicationState`);
    if (game.platforms.length === 0) errors.push(`Cheat game ${game.slug} needs at least one platform`);
    if (game.publicationState === 'published') {
      if (!game.confirmedBuild) errors.push(`Published cheat game ${game.slug} needs confirmedBuild`);
      if (game.sourceUrls.length === 0 || game.sourceUrls.some((url) => !isHttpsUrl(url))) errors.push(`Published cheat game ${game.slug} needs valid sourceUrls`);
    }
  }
  for (const entry of candidate.cheats) {
    if (!cheatGamesBySlug.has(entry.gameSlug)) errors.push(`Cheat ${entry.id} references unknown game ${entry.gameSlug}`);
    if (!entry.name.trim() || !entry.input.trim() || entry.platforms.length === 0) errors.push(`Cheat ${entry.id} needs a name, input and platforms`);
    if (entry.sourceUrls.length === 0 || entry.sourceUrls.some((url) => !isHttpsUrl(url))) errors.push(`Cheat ${entry.id} needs valid sourceUrls`);
  }

  for (const entry of candidate.values) {
    if (!gamesBySlug.has(entry.gameSlug)) errors.push(`Value ${entry.id} references unknown game ${entry.gameSlug}`);
    if (!isIsoTimestamp(entry.observedAt) || !isHttpsUrl(entry.sourceUrl)) errors.push(`Value ${entry.id} needs an ISO observedAt and HTTPS sourceUrl`);
  }
  for (const entry of candidate.updates) {
    if (!gamesBySlug.has(entry.gameSlug)) errors.push(`Update ${entry.id} references unknown game ${entry.gameSlug}`);
    if (!isIsoTimestamp(entry.publishedAt) || !isHttpsUrl(entry.sourceUrl)) errors.push(`Update ${entry.id} needs an ISO publishedAt and HTTPS sourceUrl`);
  }
  for (const entry of candidate.products) {
    if (!slugPattern.test(entry.slug) || !entry.name.trim() || !entry.price.trim() || !entry.currency.trim()) errors.push(`Product ${entry.id} needs a valid slug, name, price and currency`);
    if (!isIsoTimestamp(entry.checkedAt) || !isHttpsUrl(entry.merchantUrl) || !entry.disclosure.trim()) errors.push(`Product ${entry.id} needs a check time, merchant URL and disclosure`);
  }
  for (const entry of candidate.sponsorships) {
    if (!entry.title.trim() || !entry.label.trim() || !entry.disclosure.trim()) errors.push(`Sponsorship ${entry.id} needs title, label and disclosure`);
    if (!isHttpsUrl(entry.targetUrl) || !isIsoTimestamp(entry.startsAt) || !isIsoTimestamp(entry.endsAt)) errors.push(`Sponsorship ${entry.id} needs a target URL and ISO date range`);
    if (Date.parse(entry.endsAt) <= Date.parse(entry.startsAt)) errors.push(`Sponsorship ${entry.id} ends before it starts`);
  }

  if (candidate.services.checker.enabled && (!candidate.services.checker.scheduleMinutes || candidate.services.checker.scheduleMinutes <= 0)) {
    errors.push('Enabled checker service needs a positive scheduleMinutes');
  }
  if (candidate.services.alerts.enabled) {
    if (candidate.services.alerts.channels.length === 0) errors.push('Enabled alerts service needs at least one channel');
    if (!candidate.services.alerts.subscriptionEndpoint || !isHttpsUrl(candidate.services.alerts.subscriptionEndpoint)) errors.push('Enabled alerts service needs an HTTPS subscriptionEndpoint');
  }
  if (candidate.services.advertising.enabled) {
    if (!candidate.services.advertising.provider || !candidate.services.advertising.privacyPolicyUrl || !isHttpsUrl(candidate.services.advertising.privacyPolicyUrl)) {
      errors.push('Enabled advertising needs a provider and HTTPS privacyPolicyUrl');
    }
    if (candidate.services.advertising.placementIds.length === 0) errors.push('Enabled advertising needs at least one placementId');
  }

  const entryIds = new Set([
    ...candidate.codes.map((entry) => `code:${entry.id}`),
    ...candidate.dailyLinks.map((entry) => `dailyLink:${entry.id}`),
    ...candidate.cheats.map((entry) => `cheat:${entry.id}`),
  ]);
  for (const event of candidate.verificationEvents) {
    if (!entryIds.has(`${event.entryType}:${event.entryId}`)) errors.push(`Verification ${event.id} references an unknown entry`);
    if (!isIsoTimestamp(event.checkedAt)) errors.push(`Verification ${event.id} has an invalid checkedAt`);
    if (!['accepted', 'rejected', 'source-only', 'unreachable'].includes(event.result)) errors.push(`Verification ${event.id} has an invalid result`);
    if (!['redeemed', 'opened', 'entered', 'official-source', 'manual-review'].includes(event.method)) errors.push(`Verification ${event.id} has an invalid method`);
    if (!event.checkedBy.trim()) errors.push(`Verification ${event.id} needs checkedBy`);
  }

  for (const game of candidate.games.filter((item) => item.publicationState === 'published')) {
    const entries = game.surface === 'codes'
      ? candidate.codes.filter((entry) => entry.gameSlug === game.slug)
      : candidate.dailyLinks.filter((entry) => entry.gameSlug === game.slug);
    if (entries.length === 0) errors.push(`Published game ${game.slug} needs at least one entry`);
    if (!entries.some((entry) => candidate.verificationEvents.some((event) => event.entryId === entry.id && event.entryType === (game.surface === 'codes' ? 'code' : 'dailyLink')))) {
      errors.push(`Published game ${game.slug} needs at least one verification event`);
    }
  }

  for (const game of candidate.cheatGames.filter((item) => item.publicationState === 'published')) {
    const entries = candidate.cheats.filter((entry) => entry.gameSlug === game.slug);
    if (entries.length === 0) errors.push(`Published cheat game ${game.slug} needs at least one cheat`);
    if (!entries.some((entry) => candidate.verificationEvents.some((event) => event.entryId === entry.id && event.entryType === 'cheat'))) {
      errors.push(`Published cheat game ${game.slug} needs at least one verification event`);
    }
  }

  if (errors.length > 0) throw new Error(`Invalid operational content:\n- ${errors.join('\n- ')}`);
  return candidate;
};

export const operations = validateOperations(rawOperations as OperationalData);

const latestEventFor = (entryType: EntryType, entryId: string) => operations.verificationEvents
  .filter((event) => event.entryType === entryType && event.entryId === entryId)
  .sort((left, right) => Date.parse(right.checkedAt) - Date.parse(left.checkedAt))[0] ?? null;

const resolveState = (
  game: Pick<OperationalGame, 'verificationWindowHours'>,
  event: VerificationEvent | null,
  now: number,
): EntryState => {
  if (!event) return 'unverified';
  if (event.result === 'rejected') return 'expired';
  const staleAt = Date.parse(event.checkedAt) + game.verificationWindowHours * 60 * 60 * 1000;
  if (event.result === 'unreachable' || now >= staleAt) return 'stale';
  return event.result === 'accepted' ? 'verified' : 'reported';
};

export const resolveEntries = <T extends CodeEntry | DailyLinkEntry | CheatEntry>(
  game: Pick<OperationalGame, 'verificationWindowHours'>,
  entryType: EntryType,
  entries: T[],
  now = Date.now(),
): ResolvedEntry<T>[] => entries.map((entry) => {
  const latestEvent = latestEventFor(entryType, entry.id);
  return {
    entry,
    latestEvent,
    state: resolveState(game, latestEvent, now),
    tier: evidenceTierOf(entry as { publisherSourceUrl?: string | null }),
  };
});

export const getOperationalGame = (slug: string) => operations.games.find((game) => game.slug === slug);

export const getCheatOperationalPage = (slug: string, now = Date.now()) => {
  const game = operations.cheatGames.find((item) => item.slug === slug);
  if (!game) return null;
  const entries = resolveEntries(
    { verificationWindowHours: 30 * 24 },
    'cheat',
    operations.cheats.filter((entry) => entry.gameSlug === slug),
    now,
  );
  const latestCheckedAt = entries
    .map((item) => item.latestEvent?.checkedAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;

  return {
    game,
    entries,
    latestCheckedAt,
    verifiedCount: entries.filter((item) => item.state === 'verified').length,
    reportedCount: entries.filter((item) => item.state === 'reported').length,
    staleCount: entries.filter((item) => item.state === 'stale').length,
    isPublished: game.publicationState === 'published',
  };
};

export const getProduct = (slug: string) => operations.products.find((product) => product.slug === slug);

export const getActiveSponsorships = (now = Date.now()) => operations.sponsorships.filter(
  (entry) => Date.parse(entry.startsAt) <= now && now < Date.parse(entry.endsAt),
);

export const getGameOperationalPage = (slug: string, now = Date.now()) => {
  const game = getOperationalGame(slug);
  if (!game) return null;
  const entryType: EntryType = game.surface === 'codes' ? 'code' : 'dailyLink';
  const entries = game.surface === 'codes'
    ? resolveEntries(game, entryType, operations.codes.filter((entry) => entry.gameSlug === slug), now)
    : resolveEntries(game, entryType, operations.dailyLinks.filter((entry) => entry.gameSlug === slug), now);
  const latestCheckedAt = entries
    .map((item) => item.latestEvent?.checkedAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;

  return {
    game,
    entries,
    latestCheckedAt,
    verifiedCount: entries.filter((item) => item.state === 'verified').length,
    reportedCount: entries.filter((item) => item.state === 'reported').length,
    staleCount: entries.filter((item) => item.state === 'stale').length,
    expiredCount: entries.filter((item) => item.state === 'expired').length,
    isPublished: isIndexable(game, entries),
    values: operations.values.filter((entry) => entry.gameSlug === slug),
    updates: operations.updates.filter((entry) => entry.gameSlug === slug),
  };
};

export const formatAbsoluteTimestamp = (value: string) => new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
}).format(new Date(value)) + ' UTC';

const startOfUtcDay = (now: Date) => Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

export const operationalSummary = (now = new Date()) => {
  const publishedGames = operations.games.filter((game) => game.publicationState === 'published');
  const checksToday = operations.verificationEvents.filter((event) => Date.parse(event.checkedAt) >= startOfUtcDay(now)).length;
  const publishedEntryEvents: Array<VerificationEvent | null> = [];
  publishedGames.forEach((game) => {
    const page = getGameOperationalPage(game.slug, now.getTime());
    page?.entries.forEach((item) => publishedEntryEvents.push(item.latestEvent));
  });
  const checkedAges = publishedEntryEvents
    .map((event) => event ? now.getTime() - Date.parse(event.checkedAt) : null)
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);
  const middle = Math.floor(checkedAges.length / 2);
  const medianAgeMs = checkedAges.length === 0
    ? null
    : checkedAges.length % 2 === 0
      ? ((checkedAges[middle - 1] ?? 0) + (checkedAges[middle] ?? 0)) / 2
      : checkedAges[middle] ?? null;
  const recentlyChecked = publishedEntryEvents.filter(
    (event) => event && now.getTime() - Date.parse(event.checkedAt) <= 60 * 60 * 1000,
  ).length;

  return {
    configuredGames: operations.games.length,
    publishedGames: publishedGames.length,
    publishedCodeGames: publishedGames.filter((game) => game.surface === 'codes').length,
    publishedDailyGames: publishedGames.filter((game) => game.surface === 'daily').length,
    checksToday,
    medianAgeMs,
    recentlyCheckedPercent: publishedEntryEvents.length === 0 ? null : Math.round((recentlyChecked / publishedEntryEvents.length) * 100),
    verificationEvents: operations.verificationEvents.length,
  };
};
