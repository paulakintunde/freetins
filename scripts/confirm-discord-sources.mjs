/**
 * Resolve and score the Discord candidates from corpus mining.
 *
 * Route two produced candidate invite URLs scraped off aggregator pages. An
 * aggregator claiming a Discord exists is not evidence that it does, nor that it
 * belongs to the studio. This script asks Discord directly.
 *
 * `discord.com/api/v10/invites/{code}?with_counts=true` is public and needs no
 * token. It returns the guild name, description, feature flags, member counts and
 * vanity code — enough to decide whether an invite is the studio's own server or
 * something an aggregator linked by mistake.
 *
 * ## Scoring
 *
 * Nothing is auto-promoted to tier 0. The score sorts a human's confirmation queue
 * and nothing more, because "the guild is called the same thing as the game" is a
 * strong hint and not proof of who runs it. Signals, in rough order of weight:
 *
 * - guild name matches the game name
 * - guild description says "official"
 * - the guild holds a vanity URL (Discord grants these on boost level, so a
 *   squatter is unlikely to hold the game's exact name)
 * - PARTNERED or VERIFIED feature flags — Discord itself vouched for the guild
 * - member count at a scale consistent with the game's player base
 *
 * A dead or expired invite is a useful negative result and is recorded as such,
 * so the same bad candidate is not re-investigated by hand later.
 *
 * Usage:
 *   node scripts/confirm-discord-sources.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const candidatesPath = path.join(root, 'src', 'content', 'source-candidates.json');
const outputPath = path.join(root, 'src', 'content', 'source-candidates.json');

const REQUEST_DELAY_MS = 900;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Strip punctuation, spacing and the filler words that differ between a game and its guild. */
const normalise = (value) => (value ?? '')
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/\b(official|roblox|the|server|community|hangout|rblx|rbx)\b/g, ' ')
  .replace(/[^a-z0-9]+/g, '');

const inviteCodeOf = (url) => {
  const match = /(?:discord\.gg|discord\.com\/invite|dsc\.gg)\/([A-Za-z0-9-]+)/i.exec(url);
  return match ? match[1] : null;
};

/*
 * The creator cross-check is the strongest signal on this list, because the
 * creator name comes from Roblox's own API rather than from an aggregator. A
 * Discord guild whose name equals the owning Roblox group's name is the studio's
 * server almost by definition — it confirmed BlushCrunch Studio for Dandy's World
 * and Weak Games Corp. for Weak Legacy 2, both of which the game-name check alone
 * had scored as weak.
 *
 * Note on "unofficial": the obvious rule — penalise guilds calling themselves
 * unofficial — is wrong here and was removed after testing against real data.
 * Blue Lock Rivals is developed by a Roblox group literally named "Blue Lock
 * Rivals Unofficial Fans", so that word appears in the legitimate first-party
 * guild. The creator cross-check settles such cases correctly; a keyword rule
 * would have discarded a real tier 0 source.
 */
const scoreMatch = (guild, gameName, creatorName) => {
  const reasons = [];
  let score = 0;

  const guildKey = normalise(guild.name);
  const gameKey = normalise(gameName);
  const creatorKey = normalise(creatorName);

  if (guildKey && gameKey) {
    if (guildKey === gameKey) {
      score += 50;
      reasons.push('guild name matches game name exactly');
    } else if (guildKey.includes(gameKey) || gameKey.includes(guildKey)) {
      score += 32;
      reasons.push('guild name contains the game name');
    }
  }

  if (guildKey && creatorKey) {
    if (guildKey === creatorKey) {
      score += 50;
      reasons.push(`guild name matches the Roblox creator group "${creatorName}"`);
    } else if (guildKey.includes(creatorKey) || creatorKey.includes(guildKey)) {
      score += 30;
      reasons.push(`guild name overlaps the Roblox creator group "${creatorName}"`);
    }
  }

  const description = (guild.description ?? '').toLowerCase();
  if (/\bofficial\b/.test(description)) {
    score += 20;
    reasons.push('description says "official"');
  }
  if (gameKey && normalise(description).includes(gameKey)) {
    score += 10;
    reasons.push('description names the game');
  }

  const features = guild.features ?? [];
  if (features.includes('VERIFIED')) {
    score += 25;
    reasons.push('Discord VERIFIED');
  }
  if (features.includes('PARTNERED')) {
    score += 20;
    reasons.push('Discord PARTNERED');
  }
  if (guild.vanity_url_code) {
    score += 12;
    reasons.push(`holds vanity /${guild.vanity_url_code}`);
  }

  return { score, reasons };
};

/* ------------------------------------------------------------------ */

const corpus = JSON.parse(await readFile(candidatesPath, 'utf8'));
const operations = JSON.parse(await readFile(path.join(root, 'src', 'content', 'operations.json'), 'utf8'));
const gameNames = new Map(operations.games.map((game) => [game.slug, game.name]));

/* Creator group names come from the Roblox sweep, which reads Roblox's own API. */
const register = JSON.parse(await readFile(path.join(root, 'src', 'content', 'sources.json'), 'utf8'));
const creatorNames = new Map(register.games.map((game) => [game.gameSlug, game.creatorName]));

const discordCandidates = corpus.candidates.filter((candidate) => candidate.platform === 'discord');
console.log(`Resolving ${discordCandidates.length} Discord invites against Discord's public invite API\n`);

const resolved = [];

for (const candidate of discordCandidates) {
  const code = inviteCodeOf(candidate.url);
  const record = { ...candidate, invite: code, resolution: null };

  if (!code) {
    record.resolution = { state: 'unparseable' };
    resolved.push(record);
    continue;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
      { headers: { accept: 'application/json', 'user-agent': 'freetins-source-discovery/1.0' }, signal: AbortSignal.timeout(20_000) },
    );

    if (response.status === 404) {
      record.resolution = { state: 'dead', detail: 'invite expired or revoked' };
      console.log(`  DEAD      ${candidate.url}`);
      await sleep(REQUEST_DELAY_MS);
      resolved.push(record);
      continue;
    }
    if (!response.ok) {
      record.resolution = { state: 'error', detail: `HTTP ${response.status}` };
      console.log(`  HTTP ${response.status}  ${candidate.url}`);
      await sleep(REQUEST_DELAY_MS);
      resolved.push(record);
      continue;
    }

    const payload = await response.json();
    const guild = payload.guild ?? {};
    const primaryGame = candidate.citedForGames[0];
    const { score, reasons } = scoreMatch(
      guild,
      gameNames.get(primaryGame) ?? primaryGame,
      creatorNames.get(primaryGame),
    );

    record.resolution = {
      state: 'live',
      guildId: guild.id ?? null,
      guildName: guild.name ?? null,
      guildDescription: guild.description ?? null,
      vanityUrlCode: guild.vanity_url_code ?? null,
      features: (guild.features ?? []).filter((f) => ['VERIFIED', 'PARTNERED', 'COMMUNITY', 'DISCOVERABLE'].includes(f)),
      approximateMembers: payload.approximate_member_count ?? null,
      approximateOnline: payload.approximate_presence_count ?? null,
      matchScore: score,
      matchReasons: reasons,
    };

    const members = payload.approximate_member_count
      ? `${Math.round(payload.approximate_member_count / 1000)}k members`
      : 'unknown size';
    console.log(`  ${String(score).padStart(3)}  ${(guild.name ?? '?').padEnd(30)} ${members.padEnd(14)} <- ${primaryGame}`);
  } catch (error) {
    record.resolution = { state: 'error', detail: error.message };
    console.log(`  ERR       ${candidate.url} (${error.message})`);
  }

  await sleep(REQUEST_DELAY_MS);
  resolved.push(record);
}

/* ------------------------------------------------------------------ */

const live = resolved.filter((r) => r.resolution?.state === 'live');
const strong = live.filter((r) => r.resolution.matchScore >= 50);
const weak = live.filter((r) => r.resolution.matchScore < 50);
const dead = resolved.filter((r) => r.resolution?.state === 'dead');

console.log('\n--- Discord confirmation summary ---');
console.log(`Invites resolved live:      ${live.length}`);
console.log(`  strong match (>=50):      ${strong.length}`);
console.log(`  weak match (<50):         ${weak.length}`);
console.log(`Dead or revoked invites:    ${dead.length}`);
console.log(`Games with a strong match:  ${new Set(strong.flatMap((r) => r.citedForGames)).size}`);

corpus.candidates = corpus.candidates.map((candidate) => {
  const match = resolved.find((r) => r.url === candidate.url);
  return match ?? candidate;
});
corpus.discordConfirmedAt = new Date().toISOString();

await writeFile(outputPath, `${JSON.stringify(corpus, null, 2)}\n`, 'utf8');
console.log(`\nUpdated ${path.relative(root, outputPath)}`);
