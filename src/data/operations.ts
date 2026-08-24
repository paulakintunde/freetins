import rawOperations from '../content/operations.json' with { type: 'json' };

export type OperationalSurface = 'codes' | 'daily';
export type PublicationState = 'planned' | 'published' | 'retired';
export type EntryType = 'code' | 'dailyLink' | 'cheat';
export type VerificationResult = 'accepted' | 'rejected' | 'source-only' | 'unreachable';
export type VerificationMethod = 'redeemed' | 'opened' | 'entered' | 'official-source' | 'manual-review';
export type EntryState = 'verified' | 'reported' | 'stale' | 'expired' | 'unverified';

export interface OperationalGame {
  slug: string;
  name: string;
  surface: OperationalSurface;
  platform: string;
  publicationState: PublicationState;
  verificationWindowHours: number;
  officialSourceUrl: string | null;
  redeemSteps: string[];
}

export interface CodeEntry {
  id: string;
  gameSlug: string;
  code: string;
  reward: string;
  firstSeenAt: string;
  sourceUrls: string[];
}

export interface DailyLinkEntry {
  id: string;
  gameSlug: string;
  label: string;
  url: string;
  firstSeenAt: string;
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

export interface ResolvedEntry<T> {
  entry: T;
  latestEvent: VerificationEvent | null;
  state: EntryState;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const isHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname !== 'example.com' && !url.hostname.endsWith('.example.com');
  } catch {
    return false;
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
  return { entry, latestEvent, state: resolveState(game, latestEvent, now) };
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
    isPublished: game.publicationState === 'published',
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
