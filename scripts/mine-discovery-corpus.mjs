/**
 * Mine the existing aggregator corpus for first-party channels.
 *
 * Route two of Phase 1 source discovery. Route one — reading Roblox's declared
 * social links — is blocked: the endpoint requires an authenticated cookie, and
 * the unauthenticated fallback (scanning game and group descriptions) returned
 * ZERO channels across 14 games on 25 August 2026, with 11 of them showing
 * `hasSocialModules: true`. The links are declared; they are just not readable
 * anonymously. See scripts/discover-sources.mjs.
 *
 * This script takes the other route. The repository already holds 50 distinct
 * aggregator URLs in the `discoveredVia` fields of src/content/operations.json.
 * Aggregators routinely cite or link the Discord post they took a code from, so
 * the site's largest evidence liability doubles as its cheapest source-discovery
 * corpus.
 *
 * ## The noise problem, and how it is handled
 *
 * Every aggregator page links the aggregator's OWN socials in its header and
 * footer. Those must not become source records. Two filters:
 *
 * 1. **Site chrome.** A channel appearing on most pages of one domain is that
 *    domain's own furniture, not a game's channel. Requires >=2 sampled pages on
 *    the domain to fire, so it never mistakes a single-page domain for chrome.
 * 2. **Cross-game spread.** A channel cited for many unrelated games is generic.
 *    A game's real Discord is cited for that game.
 *
 * Everything surviving both filters is a CANDIDATE, not a confirmed source. It is
 * written with the games that cite it and the pages it came from, so a human can
 * confirm in seconds. Nothing here is promoted to tier 0 automatically — a link on
 * an aggregator page is an aggregator's claim about a channel, which is exactly
 * the kind of second-hand assertion this pipeline exists to stop trusting blindly.
 *
 * Usage:
 *   node scripts/mine-discovery-corpus.mjs             # fetch and write candidates
 *   node scripts/mine-discovery-corpus.mjs --limit 5   # sample a few pages first
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const operationsPath = path.join(root, 'src', 'content', 'operations.json');
const outputPath = path.join(root, 'src', 'content', 'source-candidates.json');

const limitArg = process.argv.indexOf('--limit');
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

const REQUEST_DELAY_MS = 1200;
const CHROME_RATIO = 0.6;
const CROSS_GAME_LIMIT = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CHANNEL_PATTERNS = [
  { platform: 'discord', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite|dsc\.gg)\/([A-Za-z0-9-]{2,32})/gi, build: (m) => `https://discord.gg/${m[1]}` },
  { platform: 'x', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{2,15})(?![A-Za-z0-9_])/gi, build: (m) => `https://x.com/${m[1]}` },
  { platform: 'youtube', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?youtube\.com\/(@[A-Za-z0-9_.-]{3,30}|c\/[A-Za-z0-9_.-]{3,30}|channel\/[A-Za-z0-9_-]{10,30})/gi, build: (m) => `https://youtube.com/${m[1]}` },
  { platform: 'twitch', pattern: /(?<![A-Za-z0-9.-])(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([A-Za-z0-9_]{3,25})/gi, build: (m) => `https://twitch.tv/${m[1]}` },
];

/** Platform paths and aggregator-adjacent handles that are never a game channel. */
const NEVER_A_CHANNEL = new Set([
  'games', 'groups', 'communities', 'users', 'catalog', 'discover', 'home', 'about',
  'intent', 'share', 'i', 'privacy', 'tos', 'login', 'signup', 'watch', 'results',
  'roblox', 'discord', 'youtube', 'twitter', 'twitch', 'playlist', 'feed', 'c', 'channel',
]);

const extractChannels = (html) => {
  const found = new Map();
  for (const { platform, pattern, build } of CHANNEL_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of html.matchAll(pattern)) {
      const token = match[1];
      if (!token || NEVER_A_CHANNEL.has(token.toLowerCase())) continue;
      const url = build(match);
      if (!found.has(url.toLowerCase())) found.set(url.toLowerCase(), { platform, url });
    }
  }
  return [...found.values()];
};

/* ------------------------------------------------------------------ */

const operations = JSON.parse(await readFile(operationsPath, 'utf8'));

/** url -> set of game slugs that cite it */
const citations = new Map();
for (const code of operations.codes) {
  for (const url of code.discoveredVia ?? []) {
    if (!citations.has(url)) citations.set(url, new Set());
    citations.get(url).add(code.gameSlug);
  }
}

const targets = [...citations.entries()].slice(0, limit);
console.log(`Mining ${targets.length} aggregator pages for first-party channels\n`);

/** channelUrl -> { platform, pages:Set, games:Set, domains:Set } */
const hits = new Map();
/** domain -> pages successfully fetched */
const pagesPerDomain = new Map();
/** domain -> channelUrl -> count of pages on that domain carrying it */
const domainChannelCounts = new Map();

let ok = 0;
let failed = 0;

for (const [pageUrl, games] of targets) {
  let domain;
  try {
    domain = new URL(pageUrl).hostname;
  } catch {
    failed += 1;
    continue;
  }

  let html;
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; freetins-source-discovery/1.0; +https://www.freetins.com/)',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) {
      console.log(`  ${String(response.status).padEnd(4)} ${pageUrl}`);
      failed += 1;
      await sleep(REQUEST_DELAY_MS);
      continue;
    }
    html = await response.text();
  } catch (error) {
    console.log(`  ERR  ${pageUrl} (${error.message})`);
    failed += 1;
    await sleep(REQUEST_DELAY_MS);
    continue;
  }

  ok += 1;
  pagesPerDomain.set(domain, (pagesPerDomain.get(domain) ?? 0) + 1);
  if (!domainChannelCounts.has(domain)) domainChannelCounts.set(domain, new Map());
  const domainCounts = domainChannelCounts.get(domain);

  const channels = extractChannels(html);
  for (const channel of channels) {
    domainCounts.set(channel.url, (domainCounts.get(channel.url) ?? 0) + 1);
    if (!hits.has(channel.url)) {
      hits.set(channel.url, { platform: channel.platform, url: channel.url, pages: new Set(), games: new Set(), domains: new Set() });
    }
    const hit = hits.get(channel.url);
    hit.pages.add(pageUrl);
    hit.domains.add(domain);
    for (const game of games) hit.games.add(game);
  }

  console.log(`  200  ${domain.padEnd(26)} ${channels.length} channel link(s)  [${[...games].join(', ')}]`);
  await sleep(REQUEST_DELAY_MS);
}

/* ---------------- filtering ---------------- */

const isChrome = (channelUrl) => {
  for (const [domain, counts] of domainChannelCounts) {
    const pages = pagesPerDomain.get(domain) ?? 0;
    if (pages < 2) continue;
    if ((counts.get(channelUrl) ?? 0) / pages >= CHROME_RATIO) return domain;
  }
  return null;
};

const candidates = [];
const rejected = [];

for (const hit of hits.values()) {
  const chromeDomain = isChrome(hit.url);
  const record = {
    platform: hit.platform,
    url: hit.url,
    citedForGames: [...hit.games].sort(),
    seenOnPages: [...hit.pages],
    seenOnDomains: [...hit.domains],
  };
  if (chromeDomain) {
    rejected.push({ ...record, reason: `site chrome on ${chromeDomain}` });
  } else if (hit.games.size > CROSS_GAME_LIMIT) {
    rejected.push({ ...record, reason: `cited across ${hit.games.size} unrelated games` });
  } else {
    candidates.push(record);
  }
}

candidates.sort((a, b) => a.platform.localeCompare(b.platform) || a.url.localeCompare(b.url));

console.log('\n--- Mining summary ---');
console.log(`Pages fetched OK:      ${ok}`);
console.log(`Pages failed:          ${failed}`);
console.log(`Distinct channel URLs: ${hits.size}`);
console.log(`Rejected as noise:     ${rejected.length}`);
console.log(`CANDIDATES:            ${candidates.length}`);

const byPlatform = {};
for (const candidate of candidates) byPlatform[candidate.platform] = (byPlatform[candidate.platform] ?? 0) + 1;
console.log('Candidates by platform:', byPlatform);

if (candidates.length) {
  console.log('\nCandidates needing human confirmation:');
  for (const candidate of candidates) {
    console.log(`  ${candidate.platform.padEnd(8)} ${candidate.url.padEnd(46)} -> ${candidate.citedForGames.join(', ')}`);
  }
}

await writeFile(outputPath, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  method: 'aggregator-corpus-mining',
  caveat: 'Every entry is an UNCONFIRMED candidate. A link on an aggregator page is that aggregator claiming a channel exists. Confirm against the game itself before promoting any of these to tier 0 or 1.',
  pagesFetched: ok,
  pagesFailed: failed,
  candidates,
  rejected,
}, null, 2)}\n`, 'utf8');

console.log(`\nWrote ${path.relative(root, outputPath)}`);
