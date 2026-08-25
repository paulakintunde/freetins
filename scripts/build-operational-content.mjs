import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const recordsDirectory = path.resolve(root, process.argv[2] ?? 'src/data/games');
const operationsPath = path.join(root, 'src', 'content', 'operations.json');

const officialGameUrls = {
  'grow-a-garden': 'https://www.roblox.com/games/126884695634066/Grow-a-Garden',
  'basketball-zero': 'https://www.roblox.com/games/130739873848552/Basketball-Zero',
  'volleyball-legends': 'https://www.roblox.com/games/73956553001240/Volleyball-Legends',
  'blue-lock-rivals': 'https://www.roblox.com/games/18668065416/Blue-Lock-Rivals',
  '99-nights-in-the-forest': 'https://www.roblox.com/games/79546208627805/99-Nights-in-the-Forest',
  'sols-rng': 'https://www.roblox.com/games/15532962292/Sols-RNG',
  'dandys-world': 'https://www.roblox.com/games/16116270224/Dandys-World',
  'type-soul': 'https://www.roblox.com/games/14067600077/TYPE-SOUL',
  'anime-card-clash': 'https://www.roblox.com/games/110829983956014/Anime-Card-Clash',
  'tennis-zero': 'https://www.roblox.com/games/81072337989394/Tennis-Zero',
  'jujutsu-zero': 'https://www.roblox.com/games/128451689942376/Jujutsu-Zero',
  'weak-legacy-2': 'https://www.roblox.com/games/18337464872/Weak-Legacy-2',
  'shindo-life': 'https://www.roblox.com/games/4616652839/Shindo-Life',
  'king-legacy': 'https://www.roblox.com/games/4520749081/King-Legacy',
};

const splitRedeemPath = (value) => value
  .split(/\.\s+|,\s+(?:then\s+)?/)
  .map((step) => step.trim().replace(/^then\s+/i, ''))
  .filter(Boolean)
  .map((step) => step.endsWith('.') ? step : `${step}.`);

const files = (await readdir(recordsDirectory))
  .filter((filename) => filename.endsWith('.json'))
  .sort();
const records = await Promise.all(files.map(async (filename) => (
  JSON.parse(await readFile(path.join(recordsDirectory, filename), 'utf8'))
)));
const operations = JSON.parse(await readFile(operationsPath, 'utf8'));
const existingGameOrder = new Map();
for (const entry of operations.codes) {
  if (!existingGameOrder.has(entry.gameSlug)) existingGameOrder.set(entry.gameSlug, existingGameOrder.size);
}
records.sort((left, right) => {
  const leftOrder = existingGameOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = existingGameOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
  return leftOrder - rightOrder;
});
const batchSlugs = new Set(records.map((record) => record.slug));
const previewHosts = ['pages.dev', 'vercel.app', 'netlify.app', 'netlify.com', 'workers.dev', 'github.io'];
const isEvidenceUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && !previewHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};
const existingCodesByKey = new Map(
  operations.codes.map((entry) => [`${entry.gameSlug}:${entry.code}`, entry]),
);

for (const slug of batchSlugs) {
  if (!officialGameUrls[slug]) throw new Error(`Missing official game URL for ${slug}`);
}

operations.games = operations.games.map((game) => {
  const record = records.find((candidate) => candidate.slug === game.slug);
  if (!record) return game;

  return {
    ...game,
    name: record.game,
    surface: 'codes',
    platform: 'Roblox',
    publicationState: 'published',
    verificationWindowHours: 24,
    officialSourceUrl: officialGameUrls[record.slug],
    redeemSteps: splitRedeemPath(record.redeem_path),
  };
});

const importedCodes = [];
const importedEvents = [];

for (const record of records) {
  record.codes.forEach((candidate, index) => {
    if (!['active', 'unverified', 'expired'].includes(candidate.status)) {
      throw new Error(`Unsupported status ${candidate.status} for ${record.slug}: ${candidate.code}`);
    }

    const sourceUrls = [...new Set(candidate.evidence)].filter(isEvidenceUrl);
    if (sourceUrls.length === 0) return;

    const id = `${record.slug}-code-${index + 1}`;
    const existing = existingCodesByKey.get(`${record.slug}:${candidate.code}`);
    importedCodes.push({
      id,
      gameSlug: record.slug,
      code: candidate.code,
      reward: candidate.reward,
      firstSeenAt: candidate.added_at ?? candidate.last_verified_at ?? record.checked_at,
      sourceUrls,
      publisherSourceUrl: existing?.publisherSourceUrl ?? null,
      discoveredVia: existing?.discoveredVia?.length ? existing.discoveredVia : sourceUrls,
    });

    if (candidate.status === 'active') {
      importedEvents.push({
        id: `${id}-source-review`,
        entryType: 'code',
        entryId: id,
        checkedAt: record.checked_at,
        result: 'source-only',
        method: 'manual-review',
        checkedBy: 'paul-a',
      });
    } else if (candidate.status === 'expired') {
      importedEvents.push({
        id: `${id}-archive-review`,
        entryType: 'code',
        entryId: id,
        checkedAt: candidate.expired_at ?? candidate.last_verified_at ?? record.checked_at,
        result: 'rejected',
        method: 'manual-review',
        checkedBy: 'paul-a',
      });
    }
  });
}

const removedEntryIds = new Set(
  operations.codes
    .filter((entry) => batchSlugs.has(entry.gameSlug))
    .map((entry) => entry.id),
);
operations.codes = [
  ...operations.codes.filter((entry) => !batchSlugs.has(entry.gameSlug)),
  ...importedCodes,
];
operations.verificationEvents = [
  ...operations.verificationEvents.filter((event) => !removedEntryIds.has(event.entryId)),
  ...importedEvents,
];

await writeFile(operationsPath, `${JSON.stringify(operations, null, 2)}\n`);

console.log(`Published ${records.length} games with ${importedCodes.length} code records and ${importedEvents.length} review events.`);
