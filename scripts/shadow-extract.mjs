/**
 * Shadow-mode extraction run.
 *
 * Phase 3. Fetches the aggregator pages already cited in `discoveredVia`, runs the
 * extractor over each, and scores the result against the codes that are actually
 * recorded for that game. Nothing is written to operations.json and nothing is
 * published — the point is to find out how good the extractor is BEFORE it is
 * allowed anywhere near a reader.
 *
 * ## What the numbers mean
 *
 * Precision  of the codes we accepted, how many are real.
 * Recall     of the real codes on the page, how many we caught.
 *
 * Recall is measured against the codes recorded for the game, not against the
 * codes on the page, so it is a FLOOR: a page legitimately may not list every code
 * the game has, and a miss there is not the extractor's fault. Precision is the
 * honest number and the one to tune on. False positives are printed in full,
 * because an unreviewed false positive is how a fabricated code reaches a page.
 *
 * The pages are aggregators, which is exactly what the pipeline will NOT use as
 * evidence. They are used here because they are the only corpus available with a
 * known answer key. An extractor that works on messy aggregator HTML will work on
 * a Discord announcement, which is far cleaner.
 *
 * Usage:
 *   node scripts/shadow-extract.mjs
 *   node scripts/shadow-extract.mjs --threshold 55
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildProfile, extract } from '../src/lib/extract-codes.ts';

const root = process.cwd();
const operations = JSON.parse(await readFile(path.join(root, 'src', 'content', 'operations.json'), 'utf8'));

const thresholdArg = process.argv.indexOf('--threshold');
const threshold = thresholdArg > -1 ? Number(process.argv[thresholdArg + 1]) : 45;

const REQUEST_DELAY_MS = 1200;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Codes recorded per game — the answer key. */
const codesByGame = new Map();
for (const code of operations.codes) {
  if (!codesByGame.has(code.gameSlug)) codesByGame.set(code.gameSlug, new Set());
  codesByGame.get(code.gameSlug).add(code.code);
}

/** Pages to sweep, with the game each was cited for. */
const pages = new Map();
for (const code of operations.codes) {
  for (const url of code.discoveredVia ?? []) {
    if (!pages.has(url)) pages.set(url, new Set());
    pages.get(url).add(code.gameSlug);
  }
}

const normalise = (value) => value.trim().toLowerCase().replace(/\s+/g, ' ');

console.log(`Shadow run over ${pages.size} pages, accept threshold ${threshold}\n`);

let truePositives = 0;
let falsePositives = 0;
let missed = 0;
const falsePositiveSamples = [];
const perPage = [];

for (const [url, games] of pages) {
  const gameSlug = [...games][0];
  const known = codesByGame.get(gameSlug) ?? new Set();
  const knownNormalised = new Map([...known].map((code) => [normalise(code), code]));

  let html;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; freetins-shadow-extract/1.0; +https://www.freetins.com/)',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) {
      await sleep(REQUEST_DELAY_MS);
      continue;
    }
    html = await response.text();
  } catch {
    await sleep(REQUEST_DELAY_MS);
    continue;
  }

  const profile = buildProfile(gameSlug, [...known]);
  const candidates = extract(html, profile);
  const accepted = candidates.filter((candidate) => candidate.score >= threshold);

  const hits = new Set();
  let pageFalse = 0;
  for (const candidate of accepted) {
    const key = normalise(candidate.token);
    if (knownNormalised.has(key)) {
      hits.add(knownNormalised.get(key));
      truePositives += 1;
    } else {
      falsePositives += 1;
      pageFalse += 1;
      if (falsePositiveSamples.length < 40) {
        falsePositiveSamples.push({ gameSlug, token: candidate.token, score: candidate.score, cues: candidate.cues });
      }
    }
  }

  /*
   * Only count a miss when the code is actually present in the page text. A code
   * the page never mentions is not something the extractor failed to find.
   */
  const text = html.toLowerCase();
  let pageMissed = 0;
  for (const code of known) {
    if (hits.has(code)) continue;
    if (text.includes(code.toLowerCase())) {
      missed += 1;
      pageMissed += 1;
    }
  }

  perPage.push({ url, gameSlug, accepted: accepted.length, hits: hits.size, false: pageFalse, missed: pageMissed });
  console.log(`  ${String(hits.size).padStart(3)} hit ${String(pageFalse).padStart(3)} false ${String(pageMissed).padStart(3)} missed  ${new URL(url).hostname}`);

  await sleep(REQUEST_DELAY_MS);
}

const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
const recall = truePositives + missed > 0 ? truePositives / (truePositives + missed) : 0;

console.log('\n--- Shadow run result ---');
console.log(`Pages scored:     ${perPage.length}`);
console.log(`True positives:   ${truePositives}`);
console.log(`False positives:  ${falsePositives}`);
console.log(`Missed (on page): ${missed}`);
console.log(`Precision:        ${(precision * 100).toFixed(1)}%`);
console.log(`Recall (floor):   ${(recall * 100).toFixed(1)}%`);

if (falsePositiveSamples.length) {
  console.log('\nFalse positives — every one of these would need review before publication:');
  for (const sample of falsePositiveSamples) {
    console.log(`  ${String(sample.score).padStart(3)}  ${sample.token.slice(0, 40).padEnd(42)} ${sample.gameSlug}  [${sample.cues.join(',')}]`);
  }
}
