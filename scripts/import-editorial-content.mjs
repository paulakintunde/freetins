import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
const targetDir = path.resolve('src/content/articles');

if (!sourceDir) throw new Error('Pass the batch Markdown directory as the first argument.');

const articles = [
  {
    source: 'gta5cheats.md', target: 'gta-5-cheats.md',
    review: 'The command words, phone numbers and controller inputs were compared with two current platform-specific references. This is a documentation review, not a claim that every entry was activated on a fresh save during publication.',
  },
  {
    source: 'sims-4-cheats.md', target: 'sims-4-cheats.md',
    review: 'Base-game syntax was checked against current EA examples and a maintained independent command reference. Pack-specific IDs can change after updates, so disputed commands remain labelled rather than being presented as tested.',
  },
  {
    source: 'minecraftcheats.md', target: 'minecraft-commands.md',
    review: 'The command families and Bedrock syntax were compared with Microsoft\'s current command documentation. Edition differences are kept visible because a valid Java command can still fail in Bedrock, and vice versa.',
  },
  {
    source: 'baldurs-gate-3-cheats.md', target: 'baldurs-gate-3-cheats.md',
    review: 'The supported-mod route and console restrictions were checked against Larian\'s modding guidance and the current mod.io catalogue. Script Extender and save editing are explicitly treated as unsupported PC tools whose compatibility can change after patches.',
  },
  {
    source: 'wordscapes-answers.md', target: 'wordscapes-answers.md',
    review: 'The first 40 answer sets were compared across independent answer references, while coin and hint mechanics were checked against PeopleFun support. The page states its coverage limit instead of claiming to contain every level.',
  },
  {
    source: 'candy-crush-boosters.md', target: 'candy-crush-free-boosters.md',
    review: 'Booster behavior was checked against King support and every method is labelled as account-dependent where appropriate. The page does not claim a public promo-code system or promise that an event or rewarded offer appears for every player.',
  },
  {
    source: 'best-gba-emulators.md', target: 'best-gba-emulators.md',
    review: 'Availability and maintenance claims were checked against official project sites and store documentation. Prices remain dated snapshots, and the guide separates emulator legality from the separate question of game-file rights.',
  },
  {
    source: 'best-gba-games.md', target: 'best-gba-games.md',
    review: 'Current Switch Online availability was checked against Nintendo and a maintained catalogue. Rankings are editorial judgement, while platform availability and subscription requirements are treated as sourced facts.',
  },
];

const linkRewrites = new Map([
  ['/game-cheats/', '/cheats/'],
  ['/game-cheats/gta-5/', '/cheats/gta-5/'],
  ['/game-cheats/sims-4/', '/cheats/the-sims-4/'],
  ['/game-cheats/minecraft/', '/cheats/minecraft/'],
  ['/game-cheats/baldurs-gate-3/', '/cheats/baldurs-gate-3/'],
  ['/game-cheats/pokemon-emerald-cheats/', '/cheats/pokemon-emerald/'],
  ['/game-cheats/pokemon-emerald/', '/cheats/pokemon-emerald/'],
  ['/pokemon-emerald-rare-candy-cheat-code/', '/cheats/pokemon-emerald/'],
  ['/walkthroughs/wordscapes/', '/answers/wordscapes/'],
  ['/walkthroughs/little-alchemy-2/', '/answers/little-alchemy/'],
  ['/walkthroughs/guess-the-emoji/', '/answers/guess-emoji-levels-1-10/'],
  ['/redeem-codes/candy-crush-boosters/', '/guides/candy-crush-free-boosters/'],
  ['/tech-guides/best-gba-emulators/', '/guides/best-gba-emulators/'],
  ['/best-gba-games-emulator-pokemon-roms-time/', '/guides/best-gba-games/'],
  ['/redeem-codes/coin-master/', '/daily/coin-master/'],
  ['/redeem-codes/doubledown-casino/', '/daily/doubledown-casino/'],
  ['/redeem-codes/roblox/shindo-life/', '/codes/shindo-life/'],
  ['/redeem-codes/roblox/king-legacy/', '/codes/king-legacy/'],
  ['/redeem-codes/roblox/', '/codes/'],
  ['/redeem-codes/', '/codes/'],
  ['/game-codes/', '/codes/'],
  ['/how-to-redeem-game-codes/', '/how-we-verify/'],
]);

const allowedInternalRoutes = new Set([
  '/', '/answers/', '/answers/100-pics-christmas-emoji/', '/answers/clear-vision-3/',
  '/answers/guess-emoji-levels-1-10/', '/answers/little-alchemy/', '/answers/little-alchemy-2-energy/',
  '/answers/wordscapes/', '/cheats/', '/cheats/baldurs-gate-3/', '/cheats/gta-5/',
  '/cheats/guitar-hero-3/', '/cheats/lego-jurassic-world/', '/cheats/minecraft/',
  '/cheats/pokemon-emerald/', '/cheats/the-sims-4/', '/codes/', '/codes/king-legacy/',
  '/codes/shindo-life/', '/daily/coin-master/', '/daily/doubledown-casino/', '/guides/',
  '/guides/best-gba-emulators/', '/guides/best-gba-games/', '/guides/candy-crush-free-boosters/',
  '/guides/gta-5-demo/', '/guides/gta-5-radio-stations/', '/how-we-verify/', '/resources/',
]);

function extractBody(source, filename) {
  const normalized = source.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Could not parse frontmatter in ${filename}.`);
  return match[1];
}

function cleanBody(source, article) {
  let body = extractBody(source, article.source)
    .replace(/^\s*# .+\n+/, '')
    .replace(/^\*\*Last Updated:[^\n]+\*\*[^\n]*\n+/m, '')
    .replace(/^## Schema markup\n[\s\S]*$/m, '')
    .replace(/\u2014/g, ':')
    .replace(/\bRe-verified\b/gi, 'Rechecked')
    .replace(/(?<![Uu]n)\bverified\b/g, 'cross-checked')
    .replace(/(?<![Uu]n)\bVerified\b/g, 'Cross-checked');

  const reviewMatch = body.match(/^## How Freetins [^\n]+\n/m);
  if (reviewMatch?.index !== undefined) {
    const reviewStart = reviewMatch.index;
    const reviewBodyStart = reviewStart + reviewMatch[0].length;
    const nextHeadingOffset = body.slice(reviewBodyStart).search(/^## /m);
    const reviewEnd = nextHeadingOffset === -1
      ? body.length
      : reviewBodyStart + nextHeadingOffset;

    body = `${body.slice(0, reviewStart)}## How this guide was reviewed\n\n${article.review}\n\n${body.slice(reviewEnd)}`;
  }

  for (const [from, to] of linkRewrites) body = body.replaceAll(from, to);

  body = body.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (full, label, href) => (
    allowedInternalRoutes.has(href) ? `[${label}](${href})` : label
  ));

  return body.replace(/\n{3,}/g, '\n\n').trim();
}

await mkdir(targetDir, { recursive: true });
for (const article of articles) {
  const source = await readFile(path.join(sourceDir, article.source), 'utf8');
  const slug = article.target.replace(/\.md$/, '');
  const output = `---\nslug: ${JSON.stringify(slug)}\n---\n\n${cleanBody(source, article)}\n`;
  await writeFile(path.join(targetDir, article.target), output, 'utf8');
}

console.log(`Imported ${articles.length} reviewed editorial articles.`);
