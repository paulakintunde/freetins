/**
 * Source discovery sweep for Roblox games.
 *
 * Phase 1 of the ingestion pipeline. This does not collect codes. It answers the
 * question that has to be answered before any collection is possible: for each
 * game, which channels does the studio actually control?
 *
 * ## What is reachable without authentication
 *
 * Confirmed by spike on 25 August 2026:
 *
 * | Endpoint                                        | Auth | Use |
 * |---|---|---|
 * | `apis.roblox.com/universes/v1/places/{id}/universe` | none | place -> universe |
 * | `games.roblox.com/v1/games?universeIds=`        | none | description, creator, `updated` |
 * | `groups.roblox.com/v1/groups/{id}`              | none | group description |
 * | `games.roblox.com/v1/games/{id}/social-links`   | 404  | does not exist |
 * | `groups.roblox.com/v1/groups/{id}/social-links` | 401  | REQUIRES A LOGGED-IN COOKIE |
 *
 * The social-links endpoint is the one that would have made this trivial, and it
 * is gated behind `.ROBLOSECURITY`. This script therefore does NOT use it. Driving
 * Roblox's API with a personal account cookie is an authentication decision that
 * belongs to a human, not to a build script, so the fallback below is what runs.
 *
 * ## The fallback
 *
 * Studios overwhelmingly repeat their channels in free text — the game description
 * and the owning group's description. Both are unauthenticated. Yield is partial
 * and measured rather than assumed: run this script and read the summary.
 *
 * `hasSocialModules` on the group tells us whether declared social links exist at
 * all, so a game whose text yields nothing but whose group has modules is a known
 * gap rather than a silent miss. Those are listed for manual follow-up.
 *
 * ## The other thing this collects
 *
 * `updated` on the universe is the game-update timestamp. That is the trigger
 * signal for adaptive poll cadence: codes cluster around updates, so the pipeline
 * subscribes to the cause rather than guessing the rhythm. `visits` and `playing`
 * are demand signals used to prioritise the recheck queue. Both are recorded here
 * because they arrive in the same response and cost nothing extra.
 *
 * Usage:
 *   node scripts/discover-sources.mjs             # sweep, write the register
 *   node scripts/discover-sources.mjs --dry-run   # sweep, print only
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const operationsPath = path.join(root, 'src', 'content', 'operations.json');
const registerPath = path.join(root, 'src', 'content', 'sources.json');
const dryRun = process.argv.includes('--dry-run');

/** Roblox rate-limits anonymous callers. Stay well under it; this is not a race. */
const REQUEST_DELAY_MS = 350;
const MAX_ATTEMPTS = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, label) => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'freetins-source-discovery/1.0' },
        signal: AbortSignal.timeout(20_000),
      });
      if (response.status === 429) {
        await sleep(2000 * attempt);
        continue;
      }
      if (!response.ok) return { error: `HTTP ${response.status}`, status: response.status };
      return { data: await response.json() };
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) return { error: `${label}: ${error.message}` };
      await sleep(1000 * attempt);
    }
  }
  return { error: `${label}: exhausted retries` };
};

/**
 * Channel patterns.
 *
 * Deliberately narrow. A false positive here becomes a source record that gets
 * polled forever and never yields, which is worse than a miss — a miss is visible
 * in the summary, a bad source is not.
 */
/*
 * `(?<![A-Za-z0-9.-])` is load-bearing, not defensive. Without it, `x.com` matches
 * the tail of `roblox.com`, and the first run of this script duly "found" three X
 * accounts — x.com/games, x.com/communities, x.com/groups — all of which were
 * Roblox's own URL paths. A false positive becomes a source record that is polled
 * forever and never yields, so the boundary stays.
 */
const CHANNEL_PATTERNS = [
  { platform: 'discord', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite|dsc\.gg)\/([A-Za-z0-9-]{2,32})/gi, build: (m) => `https://discord.gg/${m[1]}` },
  { platform: 'x', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{2,15})(?![A-Za-z0-9_])/gi, build: (m) => `https://x.com/${m[1]}` },
  { platform: 'youtube', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?youtube\.com\/(@[A-Za-z0-9_.-]{3,30}|c\/[A-Za-z0-9_.-]{3,30}|channel\/[A-Za-z0-9_-]{10,30})/gi, build: (m) => `https://youtube.com/${m[1]}` },
  { platform: 'twitch', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([A-Za-z0-9_]{3,25})/gi, build: (m) => `https://twitch.tv/${m[1]}` },
];

/** Roblox's own URL paths, never a publisher channel even when matched cleanly. */
const ROBLOX_PATHS = new Set(['games', 'groups', 'communities', 'users', 'catalog', 'discover']);

/**
 * A bare `@handle` in a group description is nearly always the studio's X account,
 * but it is ambiguous enough that it is recorded as a lead rather than a channel.
 */
const BARE_HANDLE = /(?:^|\s)@([A-Za-z0-9_]{3,15})(?!\S)/g;

/** Roblox's own accounts are not a game's publisher channel. */
const IGNORED = new Set(['roblox', 'user/roblox', '@roblox', 'RobloxDevRel']);

const extractChannels = (text, origin) => {
  if (!text) return [];
  const found = [];
  for (const { platform, pattern, build } of CHANNEL_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const url = build(match);
      if (IGNORED.has(match[1]) || IGNORED.has(match[1]?.toLowerCase())) continue;
      if (ROBLOX_PATHS.has(match[1]?.toLowerCase())) continue;
      if (!found.some((item) => item.url.toLowerCase() === url.toLowerCase())) {
        found.push({ platform, url, foundIn: origin });
      }
    }
  }
  return found;
};

const extractHandleLeads = (text, origin) => {
  if (!text) return [];
  const leads = [];
  for (const match of text.matchAll(BARE_HANDLE)) {
    if (IGNORED.has(match[1].toLowerCase())) continue;
    leads.push({ handle: `@${match[1]}`, foundIn: origin });
  }
  return leads;
};

const placeIdFrom = (url) => {
  if (!url) return null;
  const match = /\/games\/(\d+)/.exec(url);
  return match ? match[1] : null;
};

/* ------------------------------------------------------------------ */

const operations = JSON.parse(await readFile(operationsPath, 'utf8'));
const robloxGames = operations.games.filter((game) => game.surface === 'codes');

console.log(`Sweeping ${robloxGames.length} Roblox games (${robloxGames.filter((g) => g.officialSourceUrl).length} have a known place URL)\n`);

const records = [];
const groupCache = new Map();

for (const game of robloxGames) {
  const placeId = placeIdFrom(game.officialSourceUrl);
  const record = {
    gameSlug: game.slug,
    name: game.name,
    publicationState: game.publicationState,
    placeId,
    universeId: null,
    groupId: null,
    creatorName: null,
    updatedAt: null,
    visits: null,
    playing: null,
    hasSocialModules: null,
    channels: [],
    handleLeads: [],
    notes: [],
  };

  if (!placeId) {
    record.notes.push('No officialSourceUrl on the game record; nothing to resolve.');
    records.push(record);
    continue;
  }

  const universe = await fetchJson(
    `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
    `${game.slug} universe`,
  );
  await sleep(REQUEST_DELAY_MS);

  if (universe.error || !universe.data?.universeId) {
    record.notes.push(`Universe lookup failed: ${universe.error ?? 'no universeId'}`);
    records.push(record);
    continue;
  }
  record.universeId = universe.data.universeId;

  const meta = await fetchJson(
    `https://games.roblox.com/v1/games?universeIds=${record.universeId}`,
    `${game.slug} metadata`,
  );
  await sleep(REQUEST_DELAY_MS);

  if (meta.error || !meta.data?.data?.[0]) {
    record.notes.push(`Metadata lookup failed: ${meta.error ?? 'empty payload'}`);
    records.push(record);
    continue;
  }

  const detail = meta.data.data[0];
  record.updatedAt = detail.updated ?? null;
  record.visits = detail.visits ?? null;
  record.playing = detail.playing ?? null;
  record.creatorName = detail.creator?.name ?? null;
  record.channels.push(...extractChannels(detail.description, 'game-description'));
  record.handleLeads.push(...extractHandleLeads(detail.description, 'game-description'));

  if (detail.creator?.type === 'Group' && detail.creator?.id) {
    record.groupId = detail.creator.id;
    if (!groupCache.has(record.groupId)) {
      const group = await fetchJson(
        `https://groups.roblox.com/v1/groups/${record.groupId}`,
        `${game.slug} group`,
      );
      await sleep(REQUEST_DELAY_MS);
      groupCache.set(record.groupId, group.error ? null : group.data);
    }
    const group = groupCache.get(record.groupId);
    if (group) {
      record.hasSocialModules = group.hasSocialModules ?? null;
      record.channels.push(...extractChannels(group.description, 'group-description'));
      record.handleLeads.push(...extractHandleLeads(group.description, 'group-description'));
    }
  }

  // Dedupe across both description sources.
  const seen = new Set();
  record.channels = record.channels.filter((channel) => {
    const key = channel.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (record.channels.length === 0 && record.hasSocialModules) {
    record.notes.push('Group declares social modules but no channel appears in free text. Manual follow-up required.');
  }

  const summary = record.channels.length
    ? record.channels.map((c) => c.platform).join(', ')
    : (record.hasSocialModules ? 'none in text (modules exist)' : 'none');
  console.log(`  ${game.slug.padEnd(28)} ${summary}`);

  records.push(record);
}

/* ------------------------------------------------------------------ */

const resolved = records.filter((r) => r.universeId);
const withChannels = records.filter((r) => r.channels.length > 0);
const gapWithModules = records.filter((r) => r.channels.length === 0 && r.hasSocialModules);
const noPlaceId = records.filter((r) => !r.placeId);
const byPlatform = {};
for (const record of records) {
  for (const channel of record.channels) {
    byPlatform[channel.platform] = (byPlatform[channel.platform] ?? 0) + 1;
  }
}

console.log('\n--- Sweep summary ---');
console.log(`Games swept:                 ${records.length}`);
console.log(`Resolved to a universe:      ${resolved.length}`);
console.log(`Yielded >=1 channel:         ${withChannels.length}`);
console.log(`Known gap (modules, no text):${gapWithModules.length}`);
console.log(`No place URL to resolve:     ${noPlaceId.length}`);
console.log(`Handle leads (unconfirmed):  ${records.reduce((n, r) => n + r.handleLeads.length, 0)}`);
console.log('Channels by platform:', byPlatform);

const register = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  method: 'unauthenticated-description-scan',
  caveat: 'groups.roblox.com social-links requires an authenticated cookie and is deliberately not used. Channel coverage here is partial by construction; see notes per record.',
  games: records,
};

if (dryRun) {
  console.log('\n--dry-run: register not written.');
} else {
  await writeFile(registerPath, `${JSON.stringify(register, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${path.relative(root, registerPath)}`);
}
