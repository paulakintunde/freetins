#!/usr/bin/env node
/*
 * Standalone checker for dataset-backed pages.
 *
 * Runs exactly the checks the Astro loader runs (front matter, dataset
 * validation, token resolution, prose QA) without starting Astro. Two reasons
 * it exists rather than telling writers to run the build:
 *
 * 1. Concurrency. Several writers building at once collide on Astro's shared
 *    data store and fail with an EPERM rename, which looks like a content error
 *    and is not one. This script only reads.
 * 2. Speed. A full build takes about a minute. This takes under a second, so
 *    it can be run after every edit.
 *
 * Usage:
 *   node scripts/check-content.mjs                  check every section
 *   node scripts/check-content.mjs guides           check one section
 *   node scripts/check-content.mjs guides/some-slug check one page
 *
 * Add --strict to ignore docs/batch-manifest.json, so a link to a commissioned
 * page that never shipped is reported. The vetter runs that before publication.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveDisplayStatus, countRows, validateDataset } from '../src/lib/dataset.ts';
import { normaliseDataset } from '../src/lib/normalise.ts';
import { parseFrontmatter } from '../src/lib/frontmatter.ts';
import { interpolate } from '../src/lib/interpolate.ts';
import { runProseChecks } from '../src/lib/prose-qa.ts';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SECTIONS = ['guides', 'daily', 'blog'];

/*
 * Every path the site actually publishes.
 *
 * Collected by scanning source text rather than importing the route modules,
 * which would drag Astro and the content collections in and make this script
 * as slow and as collision-prone as the build it replaces. A regex sweep is
 * enough to catch the failure that matters: a link to a route that never ships.
 */
const collectLivePaths = async (strict) => {
  const live = new Set(['/']);

  const scan = async (file) => {
    let source;
    try {
      source = await readFile(path.join(root, file), 'utf8');
    } catch {
      return;
    }
    for (const match of source.matchAll(/path:\s*['"`](\/[^'"`]*)['"`]/g)) live.add(match[1]);
  };

  await scan('src/data/routes.ts');
  try {
    for (const file of await readdir(path.join(root, 'src/data/articles'))) {
      if (file.endsWith('.ts')) await scan(`src/data/articles/${file}`);
    }
  } catch { /* no editorial articles is a valid state */ }

  // Operational code and daily pages are generated per data file.
  for (const [dir, prefix] of [['src/data/games', '/codes/']]) {
    try {
      for (const file of await readdir(path.join(root, dir))) {
        if (file.endsWith('.json')) live.add(`${prefix}${file.replace(/\.json$/, '')}/`);
      }
    } catch { /* directory may not exist */ }
  }

  // Dataset-backed pages, including ones shipping in this same batch.
  for (const section of SECTIONS) {
    for (const slug of await listSlugs(section)) live.add(`/${section}/${slug}/`);
  }

  /*
   * Pages commissioned in this batch but not yet written. Without these, two
   * writers told to link each other would both fail depending on which one
   * finished first. --strict drops them so the vetter can prove every link
   * resolves to a page that actually exists.
   */
  if (!strict) {
    try {
      const manifest = JSON.parse(await readFile(path.join(root, 'docs/batch-manifest.json'), 'utf8'));
      for (const permalink of manifest.inFlight ?? []) live.add(permalink);
    } catch { /* no batch in flight */ }
  }

  return live;
};

const listSlugs = async (section) => {
  try {
    const files = await readdir(path.join(root, 'src/content', section));
    return files.filter((file) => file.endsWith('.md')).map((file) => file.replace(/\.md$/, ''));
  } catch {
    return [];
  }
};

const checkPage = async (section, slug, livePaths) => {
  const label = `${section}/${slug}`;
  const problems = [];

  let source;
  try {
    source = (await readFile(path.join(root, 'src/content', section, `${slug}.md`), 'utf8'))
      .replace(/\r\n/g, '\n');
  } catch {
    return { label, problems: [`${label}: prose file src/content/${section}/${slug}.md is missing`], counts: null };
  }

  const { frontmatter, body, errors } = parseFrontmatter(source, label);
  problems.push(...errors);

  let raw;
  try {
    raw = JSON.parse(await readFile(path.join(root, 'src/data', section, `${slug}.json`), 'utf8'));
  } catch {
    problems.push(`${label}: dataset src/data/${section}/${slug}.json is missing or is not valid JSON`);
    return { label, problems, counts: null };
  }

  const dataset = normaliseDataset(raw, slug);
  problems.push(...validateDataset(dataset));

  const { body: interpolated, unresolved } = interpolate(body, dataset, Date.now());
  if (unresolved.length) {
    problems.push(`${label}: unresolved tokens: ${[...new Set(unresolved)].join(', ')}`);
  }

  problems.push(...runProseChecks(body, interpolated, label, {
    requireUnverifiedSection: dataset.disagreements.length > 0 || dataset.unverifiedSummary.trim().length > 0,
  }));

  // Rule 7 of the contract: never link a route that does not ship.
  for (const match of interpolated.matchAll(/\]\((\/[^)#]*)/g)) {
    const target = match[1];
    if (!livePaths.has(target)) {
      problems.push(`${label}: internal link "${target}" does not match any published route`);
    }
  }

  // No checklist file is required. A tester's result is a ledger event, not a
  // document; the old verify/ files were read by nothing (docs/adr/0003).

  const anchors = [...interpolated.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)]
    .map((match) => ({ anchor: match[1].trim(), target: match[2] }));

  const counts = frontmatter ? countRows(resolveDisplayStatus(dataset.rows, Date.now())) : null;
  return { label, problems, counts, anchors };
};

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const target = args.find((arg) => !arg.startsWith('--'));
const jobs = [];

if (!target) {
  for (const section of SECTIONS) {
    for (const slug of await listSlugs(section)) jobs.push([section, slug]);
  }
} else if (target.includes('/')) {
  const [section, slug] = target.split('/');
  jobs.push([section, slug]);
} else {
  for (const slug of await listSlugs(target)) jobs.push([target, slug]);
}

if (jobs.length === 0) {
  console.log('No dataset-backed pages found to check.');
  process.exit(0);
}

const livePaths = await collectLivePaths(strict);
let failed = 0;
const anchorsByTarget = new Map();

for (const [section, slug] of jobs) {
  const { label, problems, counts, anchors } = await checkPage(section, slug, livePaths);
  for (const { anchor, target } of anchors ?? []) {
    if (!anchorsByTarget.has(target)) anchorsByTarget.set(target, []);
    anchorsByTarget.get(target).push({ page: label, anchor });
  }
  if (problems.length) {
    failed += 1;
    console.log(`\nFAIL  ${label}`);
    for (const problem of problems) console.log(`      ${problem.replace(`${label}: `, '')}`);
  } else {
    const summary = counts
      ? `${counts.activeCount} active, ${counts.unverifiedCount} unverified, ${counts.expiredCount + counts.removedCount} archived`
      : '';
    console.log(`PASS  ${label}  ${summary}`);
  }
}

/*
 * Anchor variety is a batch-level property: no single page can tell that
 * another used the same words for the same link. Only meaningful when more
 * than one page is in scope, so a single-page run stays quiet.
 */
let anchorClashes = 0;
if (jobs.length > 1) {
  for (const [target, uses] of anchorsByTarget) {
    const firstUse = new Map();
    for (const { page, anchor } of uses) {
      const key = anchor.toLowerCase();
      const owner = firstUse.get(key);
      if (owner === undefined) {
        firstUse.set(key, page);
      } else if (owner !== page) {
        anchorClashes += 1;
        console.log(`\nANCHOR  ${target}`);
        console.log(`        "${anchor}" is reused by ${owner} and ${page}`);
      }
    }
  }
}

console.log(`\n${jobs.length - failed}/${jobs.length} passed.`);
if (anchorClashes) {
  console.log(`${anchorClashes} repeated anchor(s) across pages. Vary the wording.`);
}
process.exit(failed || anchorClashes ? 1 : 0);
