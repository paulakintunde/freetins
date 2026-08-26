/**
 * Retired-vocabulary check.
 *
 * The Confirmation Ledger retires a set of words, fields and files that describe
 * verification as something typed rather than done — "Needs recheck",
 * `verificationWindowHours`, `STALE_AFTER_DAYS`, the VERIFY files and the rest
 * (docs/adr/0003-no-hand-typed-verification-claims.md). Once they are gone from the
 * code they must not creep back through a comment, a README paragraph or a page.
 *
 * Until Step 1a of the plan lands, every term below is still legitimately in use,
 * so this script REPORTS by default and exits 0. Pass --strict to fail on any hit;
 * CI switches to --strict in the same change that retires the terms, and not before.
 *
 * Files that are allowed to name retired terms — because their job is to say what
 * was retired and why — are listed in ALLOW. Nothing else is exempt.
 *
 * Usage:
 *   node scripts/check-vocabulary.mjs            # report
 *   node scripts/check-vocabulary.mjs --strict   # fail on any hit
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const strict = process.argv.includes('--strict');

/** Retired at Step 1a. Add to this list in the same PR that retires a term. */
const RETIRED = [
  'Needs recheck',
  'Source-reported',
  'Verified active',
  'verificationWindowHours',
  'STALE_AFTER_DAYS',
  'resolveDisplayStatus',
  'reviewLabel',
  'needs_human',
  'recheck_cadence',
  '-VERIFY.md',
];

/** Paths (prefix match, forward slashes) whose purpose is to document the retirement. */
const ALLOW = [
  'docs/adr/',
  'docs/ARTICLE-ROUTER.md',
  'docs/TESTING.md',
  'docs/migrations/',
  'scripts/check-vocabulary.mjs',
  'CLAUDE.md',
];

const SCAN_ROOTS = ['README.md', 'docs', 'verify', 'public', 'src', 'scripts', 'test', 'wrangler.toml'];
const TEXT = new Set(['.md', '.ts', '.mjs', '.js', '.astro', '.json', '.toml', '.txt', '.yml', '.yaml', '.css', '.html']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', 'og', 'assets']);

const files = [];

const walk = async (target) => {
  const info = await stat(target).catch(() => null);
  if (!info) return;
  if (info.isFile()) {
    if (TEXT.has(path.extname(target))) files.push(target);
    return;
  }
  for (const entry of await readdir(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    await walk(path.join(target, entry));
  }
};

for (const entry of SCAN_ROOTS) await walk(path.join(root, entry));

const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const allowed = (rel) => ALLOW.some((prefix) => rel === prefix || rel.startsWith(prefix));

const hits = [];
for (const file of files) {
  const rel = relative(file);
  if (allowed(rel)) continue;
  const content = await readFile(file, 'utf8');
  for (const term of RETIRED) {
    const count = content.split(term).length - 1;
    if (count > 0) hits.push({ rel, term, count });
  }
}

if (hits.length === 0) {
  console.log(`Retired vocabulary: no hits across ${files.length} files.`);
  process.exit(0);
}

const byTerm = new Map();
for (const hit of hits) {
  if (!byTerm.has(hit.term)) byTerm.set(hit.term, []);
  byTerm.get(hit.term).push(hit);
}

console.log(`Retired vocabulary: ${hits.length} file/term hit(s) across ${files.length} files${strict ? '' : ' (report only until Step 1a; pass --strict to fail)'}.\n`);
for (const [term, list] of byTerm) {
  console.log(`  ${term}`);
  for (const hit of list.sort((a, b) => a.rel.localeCompare(b.rel))) {
    console.log(`    ${String(hit.count).padStart(3)}  ${hit.rel}`);
  }
}

process.exit(strict ? 1 : 0);
