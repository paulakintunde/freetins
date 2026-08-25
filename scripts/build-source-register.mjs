/**
 * Build the canonical source register.
 *
 * This is the Phase 1 deliverable: one file naming, for every game, the channels
 * the studio actually controls, how each was established, and how often it should
 * be polled. Everything downstream reads this — adapters read `locator`, the
 * scheduler reads `pollPolicy`, the verifier reads `authority`.
 *
 * Three inputs, merged:
 *
 *   src/content/sources.json           Roblox sweep — universe ids, creator group,
 *                                      `updated` timestamps, visit counts.
 *   src/content/source-candidates.json Corpus mining plus Discord confirmation.
 *   src/content/sources-curated.json   Hand research for the mobile titles.
 *
 * ## Poll policy
 *
 * Derived, never typed in. Two facts decide it: how authoritative the channel is,
 * and how recently the game shipped an update. Codes cluster around updates, so a
 * game updated in the last 48 hours drops to its floor interval and a game that
 * has been silent for months backs off to a daily check. That is the whole answer
 * to "some games post codes daily and some go quiet for months" — the schedule is
 * subscribed to the cause rather than guessing the rhythm.
 *
 * A Discord source with a bot on it needs no interval at all; the gateway pushes.
 * Interval is recorded anyway as the fallback for when no bot is present.
 *
 * Usage:
 *   node scripts/build-source-register.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src', 'content');
const outputPath = path.join(contentDir, 'source-register.json');

const readJson = async (name) => JSON.parse(await readFile(path.join(contentDir, name), 'utf8'));

const operations = await readJson('operations.json');
const sweep = await readJson('sources.json');
const candidates = await readJson('source-candidates.json');
const curated = await readJson('sources-curated.json');

const HOUR = 60 * 60 * 1000;
const now = Date.now();

/** A confirmed guild-name match is the bar for treating a scraped invite as first-party. */
const STRONG_MATCH = 50;

/**
 * Interval bounds per authority tier, in minutes.
 * Tier 0 floors low because that is where a code appears first; tier 3 is only ever
 * a seed for the discovery queue and never needs to be fresh.
 */
const BOUNDS = {
  0: { floor: 5, ceiling: 360 },
  1: { floor: 15, ceiling: 720 },
  2: { floor: 60, ceiling: 1440 },
  3: { floor: 360, ceiling: 1440 },
};

const pollPolicyFor = (authority, updatedAt) => {
  const bounds = BOUNDS[authority] ?? BOUNDS[3];
  if (!updatedAt) {
    return { intervalMinutes: bounds.ceiling, basis: 'no update timestamp; parked at ceiling' };
  }

  const ageHours = (now - Date.parse(updatedAt)) / HOUR;
  if (Number.isNaN(ageHours)) {
    return { intervalMinutes: bounds.ceiling, basis: 'unparseable update timestamp' };
  }

  if (ageHours <= 48) {
    return { intervalMinutes: bounds.floor, basis: `game updated ${Math.round(ageHours)}h ago; boosted to floor for 48h` };
  }
  if (ageHours <= 24 * 14) {
    const interval = Math.min(bounds.ceiling, Math.round(bounds.floor * 4));
    return { intervalMinutes: interval, basis: `game updated ${Math.round(ageHours / 24)}d ago; active` };
  }
  if (ageHours <= 24 * 60) {
    const interval = Math.min(bounds.ceiling, Math.round(bounds.floor * 12));
    return { intervalMinutes: interval, basis: `game updated ${Math.round(ageHours / 24)}d ago; quiet` };
  }
  return { intervalMinutes: bounds.ceiling, basis: `game updated ${Math.round(ageHours / 24)}d ago; dormant, backed off to ceiling` };
};

/* ------------------------------------------------------------------ */

const sweepBySlug = new Map(sweep.games.map((game) => [game.gameSlug, game]));
const curatedBySlug = new Map(curated.games.map((game) => [game.gameSlug, game]));

/** Confirmed Discord sources, keyed by the game they were cited for. */
const discordBySlug = new Map();
for (const candidate of candidates.candidates) {
  if (candidate.platform !== 'discord') continue;
  const resolution = candidate.resolution;
  if (resolution?.state !== 'live' || resolution.matchScore < STRONG_MATCH) continue;
  for (const slug of candidate.citedForGames) {
    const existing = discordBySlug.get(slug);
    if (!existing || existing.resolution.matchScore < resolution.matchScore) {
      discordBySlug.set(slug, candidate);
    }
  }
}

const entries = [];

for (const game of operations.games) {
  const swept = sweepBySlug.get(game.slug);
  const hand = curatedBySlug.get(game.slug);
  const sources = [];

  const discord = discordBySlug.get(game.slug);
  if (discord) {
    const authority = 0;
    sources.push({
      id: `${game.slug}:discord`,
      platform: 'discord',
      authority,
      locator: { inviteUrl: discord.url, inviteCode: discord.invite, guildId: discord.resolution.guildId },
      displayName: discord.resolution.guildName,
      accessMethod: 'gateway-or-announcement-follow',
      status: 'confirmed',
      confirmedVia: `Discord invite API: ${discord.resolution.matchReasons.join('; ')}`,
      approximateMembers: discord.resolution.approximateMembers,
      discoveredVia: discord.seenOnDomains,
      pollPolicy: pollPolicyFor(authority, swept?.updatedAt),
    });
  }

  for (const channel of hand?.channels ?? []) {
    const authority = channel.authority ?? 0;
    sources.push({
      id: `${game.slug}:${channel.platform}`,
      platform: channel.platform,
      authority,
      locator: { url: channel.url ?? null, guildId: channel.guildId ?? null },
      displayName: channel.guildName ?? null,
      accessMethod: channel.platform === 'discord'
        ? 'gateway-or-announcement-follow'
        : channel.status === 'unreachable-programmatically' ? 'manual' : 'spike-required',
      status: channel.status,
      confirmedVia: channel.confirmedVia ?? 'hand research, see sources-curated.json',
      approximateMembers: channel.approximateMembers ?? null,
      discoveredVia: ['hand-research'],
      note: channel.note,
      pollPolicy: channel.status === 'unreachable-programmatically'
        ? { intervalMinutes: null, basis: 'not pollable; documented channel only' }
        : pollPolicyFor(authority, swept?.updatedAt),
    });
  }

  entries.push({
    gameSlug: game.slug,
    name: game.name,
    surface: game.surface,
    publicationState: game.publicationState,
    roblox: swept?.universeId
      ? {
          universeId: swept.universeId,
          groupId: swept.groupId,
          creatorName: swept.creatorName,
          updatedAt: swept.updatedAt,
          visits: swept.visits,
          hasSocialModules: swept.hasSocialModules,
        }
      : null,
    rewardLinkDomains: hand?.rewardLinkDomains ?? null,
    linkTtlHours: hand?.linkTtlHours ?? null,
    sources,
    gaps: buildGaps(game, swept, hand, sources),
  });
}

function buildGaps(game, swept, hand, sources) {
  const gaps = [];
  if (game.surface === 'codes' && !swept?.universeId) {
    gaps.push('No officialSourceUrl on the game record, so nothing could be resolved on Roblox.');
  }
  if (swept?.hasSocialModules && !sources.some((source) => source.platform === 'discord')) {
    gaps.push('Roblox group declares social modules but no Discord was confirmed. The declared links need an authenticated read or manual inspection.');
  }
  if (game.surface === 'daily' && !hand) {
    gaps.push('Mobile title with no hand research yet.');
  }
  if (sources.length === 0) gaps.push('No source of any kind. This game cannot be ingested.');
  return gaps;
}

/* ------------------------------------------------------------------ */

const withSources = entries.filter((entry) => entry.sources.length > 0);
const pollable = entries.flatMap((entry) => entry.sources).filter((source) => source.pollPolicy.intervalMinutes !== null);
const tier0 = entries.flatMap((entry) => entry.sources).filter((source) => source.authority === 0);

console.log('--- Source register ---');
console.log(`Games:                       ${entries.length}`);
console.log(`Games with >=1 source:       ${withSources.length}`);
console.log(`  codes surface:             ${withSources.filter((e) => e.surface === 'codes').length}`);
console.log(`  daily surface:             ${withSources.filter((e) => e.surface === 'daily').length}`);
console.log(`Total sources:               ${entries.flatMap((e) => e.sources).length}`);
console.log(`  tier 0 (first-party):      ${tier0.length}`);
console.log(`  pollable:                  ${pollable.length}`);
console.log(`Games with no source at all: ${entries.length - withSources.length}`);

console.log('\nPoll cadence spread (pollable sources):');
const spread = {};
for (const source of pollable) {
  const key = `${source.pollPolicy.intervalMinutes} min`;
  spread[key] = (spread[key] ?? 0) + 1;
}
for (const [interval, count] of Object.entries(spread).sort((a, b) => Number.parseInt(a[0], 10) - Number.parseInt(b[0], 10))) {
  console.log(`  ${interval.padEnd(10)} ${count}`);
}

await writeFile(outputPath, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  inputs: ['sources.json', 'source-candidates.json', 'sources-curated.json'],
  games: entries,
}, null, 2)}\n`, 'utf8');

console.log(`\nWrote ${path.relative(root, outputPath)}`);
