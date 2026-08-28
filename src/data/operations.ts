import rawOperations from '../content/operations.json' with { type: 'json' };

export type OperationalSurface = 'codes' | 'daily';
export type PublicationState = 'planned' | 'published' | 'retired';
export type EntryType = 'code' | 'dailyLink' | 'cheat';
export type VerificationResult = 'accepted' | 'rejected' | 'source-only' | 'unreachable';
/**
 * How a check was performed.
 *
 * `reader-corroborated` and `automated-fetch` are additions for the ingestion
 * pipeline, and both exist to keep claims distinguishable rather than to add
 * capability:
 *
 * - `reader-corroborated` records that independent readers reported an entry
 *   working. It is deliberately NOT `redeemed`. src/lib/code-reports.ts argues at
 *   length that letting a vote count produce the verified label would recreate the
 *   unverified-consensus problem this site exists to avoid, and that argument still
 *   holds. Naming reader signal separately is what lets it be reported honestly
 *   without being laundered into verification.
 * - `automated-fetch` records that a worker resolved a reward URL, not that a human
 *   checked it. Cheap to preserve now, impossible to reconstruct later.
 */
export type VerificationMethod =
  | 'redeemed'
  | 'opened'
  | 'entered'
  | 'official-source'
  | 'reader-corroborated'
  | 'automated-fetch'
  | 'manual-review';
/**
 * The public state of an entry. One vocabulary on every page system:
 *
 * - `verified`: the newest event on the entry is an editor acceptance.
 * - `active`: the carried-over as-published baseline. No operational entry
 *   produces it today; it exists so the type matches the dataset surface and the
 *   cutover sighting can carry it.
 * - `listed`: everything live that is not verified or active. Every new entry
 *   lands here, fully rendered and fully indexed, until an editor acts.
 * - `expired`: editor-rejected, or a link whose own `expiresAt` has passed.
 *
 * No state ever changes because time passed. The only clock input is a link's
 * `expiresAt`, read at build time.
 */
export type EntryState = 'verified' | 'active' | 'listed' | 'expired';

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
  /**
   * How many days the editor queue aims to leave between rechecks of this game.
   * A queue target only: nothing reads it to derive a state, and no state changes
   * because the target has passed.
   */
  recheckTargetDays: number;
  /** The game's own listing. Used to link the game, never to source a code. */
  officialSourceUrl: string | null;
  /** Channels the publisher posts codes on. Empty means no code here can be confirmed. */
  publisherChannels?: PublisherChannel[];
  /**
   * Evidence-backed explanation for a published code page with no current rows.
   * This preserves an honest no-active-codes answer without allowing unfinished
   * published pages to bypass the ordinary entry requirement.
   */
  emptyStateReason?: string | null;
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
  /** Where on the ladder `publisherSourceUrl` sits. Absent means tier 0. */
  publisherTier?: EvidenceTier;
  confidence?: EntryConfidence;
  /** Set by the pipeline when sources disagree and an editor has to decide. */
  needsHuman?: boolean;
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
  /** Where on the ladder `publisherSourceUrl` sits. Absent means tier 0. */
  publisherTier?: EvidenceTier;
  confidence?: EntryConfidence;
  needsHuman?: boolean;
  /**
   * Reward links die on a schedule the publisher controls. Recorded so an entry can
   * expire on its own TTL even when no check runs, which stops a pipeline outage
   * leaving a dead link presented as current.
   */
  expiresAt?: string | null;
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
  /**
   * Whether the reader-report control is rendered at all.
   *
   * It is configuration rather than a runtime probe, and that is the whole point.
   * `/api/code-report.json` refuses both verbs unless the `REPORTS` namespace and
   * `REPORT_SECRET` are both bound, so a control rendered against an unconfigured
   * endpoint is a button that fails in silence. Asking the endpoint at load time
   * would answer that question honestly and charge a metered Function request per
   * control per page view to do it; reading a boolean at build time answers it for
   * nothing (`docs/adr/0005-the-free-plan-is-the-design-target.md`).
   *
   * There is no companion field because there is nothing else to configure: the
   * namespace and the secret live in the Cloudflare project, not here. The flag
   * stays `false` until an operator has created both, and that ordering is what
   * keeps the fail-closed promise. Turning it on before them renders a control
   * that answers 503; leaving it off after them costs a redeploy, which is the
   * cheaper mistake of the two.
   */
  reports: { enabled: boolean };
  advertising: { enabled: boolean; provider: string | null; privacyPolicyUrl: string | null; placementIds: string[] };
}

export interface VerificationEvent {
  id: string;
  entryType: EntryType;
  entryId: string;
  checkedAt: string;
  result: VerificationResult;
  method: VerificationMethod;
  /** A person's handle, or a worker id such as `checker-bot`. */
  checkedBy: string;
  /**
   * Which source in src/content/source-register.json produced this check. Lets a
   * source's reliability be measured from its own record of hits and misses rather
   * than asserted, which is what makes adaptive poll cadence possible.
   */
  sourceId?: string;
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
 * How well an entry is sourced. Orthogonal to `EntryState`: state answers "what has
 * an editor recorded", tier answers "do we know the publisher ever issued this". A
 * redeemed code is verified whatever the paper trail, and a code reposted by fifty
 * blogs is still community-reported.
 *
 * ## Why this is a four-rung ladder and not a boolean
 *
 * The binary this replaced could not describe how codes are actually distributed.
 * Roblox studios routinely hand codes to named creators to release, so "the
 * studio's own Discord" and "a creator the studio delegated to" are both genuine
 * publisher evidence while being materially different claims. Collapsing them lost
 * the distinction; treating the delegated case as community-reported understated
 * evidence the site actually holds.
 *
 *   0  First-party release   the studio's own channel. The code is issued here.
 *   1  First-party delegated a creator or CM the studio explicitly releases through.
 *   2  Community primary     a player-run Discord or forum. Circulation, not release.
 *   3  Aggregator            an outlet repeating a claim. Never evidence.
 *
 * The ladder matches `DatasetEvidence` in src/lib/dataset.ts, which already used
 * 0-3. The two models disagreed on the same concept; this is the side that moved.
 */
export type EvidenceTier = 0 | 1 | 2 | 3;

/**
 * What the reader is told. Deliberately coarser than the internal ladder.
 *
 * The published vocabulary on /how-we-verify/ is publisher-confirmed versus
 * community-reported, and readers have that contract. A richer internal model must
 * not silently redefine it, so tiers 0 and 1 both render as publisher-confirmed and
 * 2 and 3 as community-reported. The extra resolution serves the pipeline, which
 * needs to know whether a code came from the studio or from someone the studio
 * delegated to; it does not need to reach the page to be worth recording.
 */
export type EvidenceLabel = 'publisher-confirmed' | 'community-reported';

export const evidenceLabelOf = (tier: EvidenceTier): EvidenceLabel =>
  tier <= 1 ? 'publisher-confirmed' : 'community-reported';

/** How confident we are in the entry itself, independent of who reported it. */
export type EntryConfidence = 'confirmed' | 'reported' | 'conflicting';

export interface ResolvedEntry<T> {
  entry: T;
  latestEvent: VerificationEvent | null;
  state: EntryState;
  tier: EvidenceTier;
  label: EvidenceLabel;
}

/**
 * `publisherTier` lets the pipeline record that a code came from a delegated
 * creator rather than the studio's own channel. Absent, a publisher URL is assumed
 * to be tier 0, which is how every hand-authored entry behaved before the ladder
 * existed and keeps existing data meaning exactly what it meant.
 */
export const evidenceTierOf = (
  entry: { publisherSourceUrl?: string | null; publisherTier?: EvidenceTier },
): EvidenceTier => {
  if (!entry.publisherSourceUrl) return 3;
  return entry.publisherTier ?? 0;
};

export interface EntryCitation {
  url: string;
  label: string;
  tier: EvidenceTier;
  evidenceLabel: EvidenceLabel;
}

/**
 * The citation a row shows the reader.
 *
 * `publisherSourceUrl` is the strong form and remains the only thing that reads as
 * publisher-confirmed. Community and aggregator evidence stays in `sourceUrls` for
 * internal audit, but is not emitted as a public outbound citation from a row.
 *
 * `discoveredVia` is deliberately not consulted. An aggregator repeating another
 * aggregator is not corroboration, and surfacing it here would launder it into one.
 */
export const citationFor = (
  entry: { publisherSourceUrl?: string | null; publisherTier?: EvidenceTier; sourceUrls?: string[] },
): EntryCitation | null => {
  if (entry.publisherSourceUrl) {
    const tier = evidenceTierOf(entry);
    return {
      url: entry.publisherSourceUrl,
      label: tier === 1 ? 'Publisher-released via creator' : 'Publisher post',
      tier,
      evidenceLabel: evidenceLabelOf(tier),
    };
  }
  const reported = (entry.sourceUrls ?? []).find((url) => isHttpsUrl(url));
  if (!reported) return null;
  return {
    url: reported,
    label: 'Community-reported',
    tier: 3,
    evidenceLabel: 'community-reported',
  };
};

/**
 * An entry the page shows in its main table: anything not expired. A listed entry
 * is live content the reader can see and act on; whether an editor has tested it
 * is what the state label says, not what decides whether it is shown.
 */
export const isLiveState = (state: EntryState) => state !== 'expired';

/**
 * Whether a game's page deserves an index entry. Content only.
 *
 * `publicationState` used to decide this on its own, which made indexing a flag
 * somebody had to remember to flip. The three highest-intent daily-link pages,
 * Monopoly GO, Coin Master and Dice Dreams, sat `planned` and therefore noindexed
 * with no defect anywhere in the data: nothing was wrong, nobody had thrown the
 * switch. That is the wrong failure mode for the most valuable pages on the site.
 *
 * So `planned` means "waiting on data" rather than "switched off", and the page
 * indexes itself the moment a single live entry lands. Nothing else is consulted:
 * no verification event, no editor star, no timer. A page whose entries are all
 * Listed · awaiting editor verification is indexed like any other, and no Listed
 * page is ever noindexed (ADR 0004). Empty pages stay out because there is nothing
 * on them, which is about emptiness, not verification.
 *
 * The furniture a page wants, `officialSourceUrl` and two `redeemSteps`, is not a
 * gate input either. Its absence is a queue warning printed by
 * scripts/check-operational-data.mjs, and a validator rule on the published flag.
 *
 * `published` keeps its bypass for now. The fourteen games it indexes today are
 * pinned when the ledger lands, so the bypass can retire in Step 5 with nothing
 * changing for them (README says the same). `retired` stays out regardless, which
 * is the whole point of retiring something.
 */
export const isIndexable = (
  game: Pick<OperationalGame, 'publicationState'>,
  entries: ResolvedEntry<CodeEntry | DailyLinkEntry | CheatEntry>[],
): boolean => {
  if (game.publicationState === 'retired') return false;
  if (game.publicationState === 'published') return true;
  return entries.some((item) => isLiveState(item.state));
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
    if (!Number.isFinite(game.recheckTargetDays) || game.recheckTargetDays <= 0) errors.push(`Game ${game.slug} needs a positive recheckTargetDays`);
    if (game.officialSourceUrl !== null && !isHttpsUrl(game.officialSourceUrl)) errors.push(`Game ${game.slug} has an invalid officialSourceUrl`);
    if (game.emptyStateReason !== undefined && game.emptyStateReason !== null && !game.emptyStateReason.trim()) errors.push(`Game ${game.slug} has an empty emptyStateReason`);
    if (game.emptyStateReason && game.surface !== 'codes') errors.push(`Game ${game.slug} can declare an emptyStateReason only on the codes surface`);
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
    if (entry.publisherTier !== undefined && ![0, 1, 2, 3].includes(entry.publisherTier)) {
      errors.push(`Entry ${entry.id} has an out-of-range publisherTier`);
    }
    if (entry.confidence !== undefined && !['confirmed', 'reported', 'conflicting'].includes(entry.confidence)) {
      errors.push(`Entry ${entry.id} has an invalid confidence`);
    }
    /*
     * The corroboration rule, carried over from the dataset model where it already
     * applied to guide rows: nothing is confirmed on a single source, and at least
     * one of those sources has to be the publisher's own or one they released
     * through. Without this, `confirmed` degrades into a synonym for "we are fairly
     * sure", which is what `reported` already says honestly.
     */
    if (entry.confidence === 'confirmed') {
      const tier = evidenceTierOf(entry);
      if (!entry.publisherSourceUrl || tier > 1) {
        errors.push(`Entry ${entry.id} is confirmed but has no tier 0 or 1 publisher source`);
      }
      if (entry.sourceUrls.length < 1) {
        errors.push(`Entry ${entry.id} is confirmed but carries no corroborating source`);
      }
    }
    if ('expiresAt' in entry && entry.expiresAt && !isIsoTimestamp(entry.expiresAt)) {
      errors.push(`Entry ${entry.id} has an invalid expiresAt`);
    }
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
  /*
   * `reports` has no dependent field to check, so the rule is the type itself.
   * It is checked rather than assumed because `"false"` is a plausible thing to
   * type into JSON and is truthy at every reader that does not compare against
   * `true`, and it is required rather than defaulted because a schema that gains
   * a service while the data forgets it should fail the build rather than read as
   * a silent `false` nobody chose.
   */
  if (typeof candidate.services.reports?.enabled !== 'boolean') {
    errors.push('services.reports.enabled must be a boolean');
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
    if (!['redeemed', 'opened', 'entered', 'official-source', 'reader-corroborated', 'automated-fetch', 'manual-review'].includes(event.method)) errors.push(`Verification ${event.id} has an invalid method`);
    if (!event.checkedBy.trim()) errors.push(`Verification ${event.id} needs checkedBy`);
    /*
     * Reader signal must never arrive as an acceptance. `accepted` is what produces
     * the verified label, and a vote count producing that label is precisely the
     * failure this site exists to avoid. The rule is enforced here rather than left
     * to the writer's discipline, because it is the one that matters most.
     */
    if (event.method === 'reader-corroborated' && event.result === 'accepted') {
      errors.push(`Verification ${event.id} is reader-corroborated and cannot record an accepted result`);
    }
  }

  /*
   * Published games normally need entries. A code page may instead carry an
   * explicit evidence-backed empty state; that is a deliberate answer, not a
   * placeholder. The reason becomes invalid once rows exist so it cannot silently
   * go stale when a code is later published.
   */
  for (const game of candidate.games.filter((item) => item.publicationState === 'published')) {
    const entries = game.surface === 'codes'
      ? candidate.codes.filter((entry) => entry.gameSlug === game.slug)
      : candidate.dailyLinks.filter((entry) => entry.gameSlug === game.slug);
    const emptyStateReason = game.emptyStateReason?.trim() ?? '';
    if (entries.length === 0 && !emptyStateReason) errors.push(`Published game ${game.slug} needs at least one entry or an emptyStateReason`);
    if (entries.length > 0 && emptyStateReason) errors.push(`Published game ${game.slug} has entries and cannot declare an emptyStateReason`);
  }

  for (const game of candidate.cheatGames.filter((item) => item.publicationState === 'published')) {
    const entries = candidate.cheats.filter((entry) => entry.gameSlug === game.slug);
    if (entries.length === 0) errors.push(`Published cheat game ${game.slug} needs at least one cheat`);
  }

  if (errors.length > 0) throw new Error(`Invalid operational content:\n- ${errors.join('\n- ')}`);
  return candidate;
};

export const operations = validateOperations(rawOperations as OperationalData);

const latestEventFor = (entryType: EntryType, entryId: string) => operations.verificationEvents
  .filter((event) => event.entryType === entryType && event.entryId === entryId)
  .sort((left, right) => Date.parse(right.checkedAt) - Date.parse(left.checkedAt))[0] ?? null;

/**
 * The state an entry displays, from its newest event and nothing else.
 *
 * The one clock input allowed anywhere is a link's own `expiresAt`: a reward link
 * dies on the publisher's schedule whether or not anyone looks at it, so a passed
 * TTL is Expired at build time. No other transition depends on the time of day:
 * an event does not go stale, and an entry nobody has tested stays Listed until an
 * editor acts on it.
 *
 * Baseline mapping for the events that exist today: `rejected` is Expired,
 * `accepted` is Verified, `source-only` and `unreachable` are Listed, as is an
 * entry with no event at all.
 */
export const resolveState = (
  entry: { expiresAt?: string | null },
  event: VerificationEvent | null,
  now: number,
): EntryState => {
  if (entry.expiresAt && Date.parse(entry.expiresAt) <= now) return 'expired';
  if (!event) return 'listed';
  if (event.result === 'rejected') return 'expired';
  if (event.result === 'accepted') return 'verified';
  return 'listed';
};

export const resolveEntries = <T extends CodeEntry | DailyLinkEntry | CheatEntry>(
  entryType: EntryType,
  entries: T[],
  now = Date.now(),
): ResolvedEntry<T>[] => entries.map((entry) => {
  const latestEvent = latestEventFor(entryType, entry.id);
  const tier = evidenceTierOf(entry as { publisherSourceUrl?: string | null; publisherTier?: EvidenceTier });
  return {
    entry,
    latestEvent,
    state: resolveState(entry as { expiresAt?: string | null }, latestEvent, now),
    tier,
    label: evidenceLabelOf(tier),
  };
});

/** The per-state tally a page reports. `liveCount` is everything not expired. */
export const countEntryStates = (entries: ResolvedEntry<unknown>[]) => ({
  verifiedCount: entries.filter((item) => item.state === 'verified').length,
  activeCount: entries.filter((item) => item.state === 'active').length,
  listedCount: entries.filter((item) => item.state === 'listed').length,
  expiredCount: entries.filter((item) => item.state === 'expired').length,
  liveCount: entries.filter((item) => isLiveState(item.state)).length,
});

const latestCheckedAtOf = (entries: ResolvedEntry<unknown>[]) => entries
  .map((item) => item.latestEvent?.checkedAt)
  .filter((value): value is string => Boolean(value))
  .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;

/*
 * When this page's record came into being, and when it last demonstrably moved.
 *
 * `dateModified` used to come from `latestCheckedAt` alone, which meant only the
 * 14 of 53 code pages carrying a recorded check said anything at all about their
 * own age. The other 39 held a full table of dated entries and published no date.
 *
 * Both values are read off recorded facts and never off the build clock, which is
 * the line the standing rule draws. `firstSeenAt` is when an entry entered the
 * record, not an assertion that anyone checked it, so it makes no verification
 * claim and docs/adr/0003 is untouched: a page with no check still shows no star,
 * no verified count and no check date. Taking the later of the newest entry and
 * the newest check keeps `dateModified` honest in both directions - adding a code
 * changes the page just as much as re-checking one does.
 *
 * Every one of the 320 entries in the record carries `firstSeenAt`, so this
 * resolves for every page that has a single entry.
 */
const recordDatesOf = (entries: ResolvedEntry<unknown>[]) => {
  /*
   * Read rather than typed, because the three entry shapes do not agree: codes and
   * daily links carry `firstSeenAt`, cheats do not. A cheat page therefore keeps
   * the behaviour it already had - a `dateModified` from its newest check, and no
   * `datePublished` - instead of being excluded from the helper entirely.
   */
  const seen = entries
    .map((item) => (item.entry as { firstSeenAt?: unknown }).firstSeenAt)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .sort();
  const checked = latestCheckedAtOf(entries);
  const newest = [seen.at(-1), checked]
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;

  return { recordCreatedAt: seen[0] ?? null, recordChangedAt: newest };
};

export const getOperationalGame = (slug: string) => operations.games.find((game) => game.slug === slug);

export const getCheatOperationalPage = (slug: string, now = Date.now()) => {
  const game = operations.cheatGames.find((item) => item.slug === slug);
  if (!game) return null;
  const entries = resolveEntries('cheat', operations.cheats.filter((entry) => entry.gameSlug === slug), now);

  return {
    game,
    entries,
    latestCheckedAt: latestCheckedAtOf(entries),
    ...recordDatesOf(entries),
    ...countEntryStates(entries),
    isPublished: isIndexable(game, entries),
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
    ? resolveEntries(entryType, operations.codes.filter((entry) => entry.gameSlug === slug), now)
    : resolveEntries(entryType, operations.dailyLinks.filter((entry) => entry.gameSlug === slug), now);

  return {
    game,
    entries,
    latestCheckedAt: latestCheckedAtOf(entries),
    ...recordDatesOf(entries),
    ...countEntryStates(entries),
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

/**
 * Site-wide figures for the homepage pulse. Counts only: no median age, no
 * "checked in the last hour", nothing that reads the clock. A figure that decays
 * while nobody acts would be a timer wearing a different label.
 */
export const operationalSummary = (now = Date.now()) => {
  const pages = operations.games
    .map((game) => getGameOperationalPage(game.slug, now))
    .filter((page): page is NonNullable<typeof page> => page !== null);
  const publishedPages = pages.filter((page) => page.isPublished);
  const sum = (key: 'verifiedCount' | 'activeCount' | 'listedCount' | 'expiredCount' | 'liveCount') =>
    publishedPages.reduce((total, page) => total + page[key], 0);

  return {
    configuredGames: operations.games.length,
    publishedGames: publishedPages.length,
    publishedCodeGames: publishedPages.filter((page) => page.game.surface === 'codes').length,
    publishedDailyGames: publishedPages.filter((page) => page.game.surface === 'daily').length,
    verifiedCount: sum('verifiedCount'),
    activeCount: sum('activeCount'),
    listedCount: sum('listedCount'),
    expiredCount: sum('expiredCount'),
    liveCount: sum('liveCount'),
    verificationEvents: operations.verificationEvents.length,
  };
};
