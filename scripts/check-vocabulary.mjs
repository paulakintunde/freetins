/**
 * Retired-vocabulary check.
 *
 * The Confirmation Ledger retires a set of words, fields and files that describe
 * verification as something typed rather than done, or a state as something the
 * clock changes: the "Needs recheck" label, the freshness-window setting, the
 * timer constant, the VERIFY files and the rest
 * (docs/adr/0003-no-hand-typed-verification-claims.md,
 * docs/adr/0004-every-article-gets-a-pass.md). Once they are gone from the code
 * they must not creep back through a comment, a README paragraph or a page.
 *
 * CI runs --strict: every term in RETIRED is fatal outside the exemptions below.
 * Terms in SCHEDULED are reported and never fatal until the step that retires
 * them moves them to RETIRED. Without --strict the script prints the same report
 * and exits 0.
 *
 * What is scanned: SCAN_ROOTS (README.md, CLAUDE.md, package.json,
 * astro.config.mjs, tsconfig.json, wrangler.toml, .github, docs, verify, public,
 * src, scripts, test). A file counts as text by its extension (TEXT); a file with
 * no extension under public/ (_headers, _redirects) is text too. node_modules,
 * dist and .astro are never entered, and public/og and src/assets are skipped
 * because they hold artwork only. Nothing else is skipped.
 *
 * Three exemptions, nothing else:
 *   - ALLOW: files whose job is to say what was retired and why (whole file).
 *   - MARKER: a line carrying `retired-vocabulary: allow, <reason>` is skipped.
 *     The reason is mandatory: the marker must be followed by a comma, a space
 *     and a non-space character, or it is not a marker. It is honoured only in
 *     MARKER_PATHS, the paths that never render to a reader (docs/, scripts/,
 *     test/, src/lib/, README.md, .github/). Anywhere else the marker is ignored
 *     and the term counts, so a retired label can never ship to a reader behind
 *     a comment.
 *   - BASELINE_KEYS in BASELINE_FILES: a retired field in KEY position of a data
 *     file is the as-published baseline the build reads (docs/adr/0004 §3) or a
 *     typed claim the build ignores and check:content lists (docs/adr/0004 §5),
 *     never a claim the site displays. Key position means the term sits at the
 *     start of the line or after `{` or `,`, optionally quoted, and is followed
 *     by a colon. Only those key matches are subtracted from the line's count;
 *     the same term in the VALUE of that line still counts. The dataset files
 *     (src/data/{guides,daily,blog}/*.json) are in BASELINE_FILES so that a
 *     v1-shaped incoming page is never bounced by this guard.
 *
 * Hits are counted per line. Add a term to RETIRED in the same PR that retires it.
 *
 * Usage:
 *   node scripts/check-vocabulary.mjs            # report, exit 0
 *   node scripts/check-vocabulary.mjs --strict   # exit 1 on any fatal hit
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const strict = process.argv.includes('--strict');

/** Retired at Step 1a. Any hit outside the three exemptions is fatal under --strict. */
const RETIRED = [
  'Needs recheck',
  'need recheck',
  'Source-reported',
  'source-reported',
  'Verified active',
  'verificationWindowHours',
  'STALE_AFTER_DAYS',
  'resolveDisplayStatus',
  'needs_human',
  'recheck_cadence',
  '-VERIFY.md',
];

/**
 * Scheduled for a later step: reported in every mode, never fatal, so CI shows
 * the hits before the PR that retires them. Move a term to RETIRED in that PR.
 */
const SCHEDULED = { '1b': ['reviewLabel', 'reviewedAt'] };

/** Paths (prefix match, forward slashes) whose purpose is to document the retirement. */
const ALLOW = [
  'docs/adr/',
  'docs/migrations/',
  'docs/WRITER-CONTRACT.md',
  'scripts/check-vocabulary.mjs',
];

/**
 * The marker. The reason after the comma is mandatory; a bare
 * `retired-vocabulary: allow` is not a marker.
 */
const MARKER = /retired-vocabulary: allow, \S/;

/** The only paths where the marker is honoured: none of them renders to a reader. */
const MARKER_PATHS = ['docs/', 'scripts/', 'test/', 'src/lib/', 'README.md', '.github/'];

/**
 * Data files where a retired field in key position is read as the as-published
 * baseline or listed as a typed claim, never displayed: src/data/games/*.json
 * are frozen importer inputs read by nothing at build; src/data/articles/*.ts
 * carry the article review line until Step 1b replaces it with an event; the
 * dataset files under src/data/{guides,daily,blog} may arrive in the v1 shape
 * and are accepted as they are (docs/adr/0004 §5).
 */
const BASELINE_FILES = [
  /^src\/data\/games\/[^/]+\.json$/,
  /^src\/data\/articles\/[^/]+\.ts$/,
  /^src\/data\/(guides|daily|blog)\/[^/]+\.json$/,
];
const BASELINE_KEYS = new Set(['needs_human', 'recheck_cadence', 'reviewLabel', 'reviewedAt']);

const SCAN_ROOTS = [
  'README.md',
  'CLAUDE.md',
  'package.json',
  'astro.config.mjs',
  'tsconfig.json',
  'wrangler.toml',
  '.github',
  'docs',
  'verify',
  'public',
  'src',
  'scripts',
  'test',
];
const TEXT = new Set(['.md', '.ts', '.mjs', '.js', '.astro', '.json', '.toml', '.txt', '.yml', '.yaml', '.css', '.html']);
/** Never entered, wherever they sit. */
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro']);
/** Artwork only (prefix match, forward slashes). */
const SKIP_PATHS = ['public/og/', 'src/assets/'];

const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const underAny = (rel, prefixes) => prefixes.some((prefix) => rel === prefix || rel.startsWith(prefix));

const files = [];

const walk = async (target) => {
  const info = await stat(target).catch(() => null);
  if (!info) return;
  const rel = relative(target);
  if (info.isFile()) {
    const extension = path.extname(target);
    if (TEXT.has(extension) || (extension === '' && rel.startsWith('public/'))) files.push(target);
    return;
  }
  for (const entry of await readdir(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    const child = path.join(target, entry);
    if (underAny(`${relative(child)}/`, SKIP_PATHS)) continue;
    await walk(child);
  }
};

for (const entry of SCAN_ROOTS) await walk(path.join(root, entry));

const allowed = (rel) => underAny(rel, ALLOW);
const markerHonoured = (rel) => underAny(rel, MARKER_PATHS);
const escape = (term) => term.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
/** The term as a key: a structural prefix, the term (optionally quoted), a colon. */
const keyPosition = (term) => new RegExp(`(^\\s*|[{,]\\s*)["']?${escape(term)}["']?\\s*:`, 'g');
const isBaselineFile = (rel) => BASELINE_FILES.some((re) => re.test(rel));

/**
 * Occurrences of `term` in `content`, counted per line. A marked line in a
 * never-rendered path is skipped; in a baseline file the key-position matches
 * are subtracted and the rest of the line still counts.
 */
const countHits = (content, term, rel) => {
  let count = 0;
  const baselineKey = BASELINE_KEYS.has(term) && isBaselineFile(rel);
  const marked = markerHonoured(rel);
  for (const line of content.split('\n')) {
    if (!line.includes(term)) continue;
    if (marked && MARKER.test(line)) continue;
    const keys = baselineKey ? (line.match(keyPosition(term)) || []).length : 0;
    count += line.split(term).length - 1 - keys;
  }
  return count;
};

const hits = [];
for (const file of files) {
  const rel = relative(file);
  if (allowed(rel)) continue;
  const content = await readFile(file, 'utf8');
  for (const term of RETIRED) {
    const count = countHits(content, term, rel);
    if (count > 0) hits.push({ rel, term, count, fatal: true });
  }
  for (const [step, terms] of Object.entries(SCHEDULED)) {
    for (const term of terms) {
      const count = countHits(content, term, rel);
      if (count > 0) hits.push({ rel, term: `${term} (scheduled: Step ${step})`, count, fatal: false });
    }
  }
}

const fatal = hits.filter((hit) => hit.fatal);
const scheduled = hits.length - fatal.length;

if (hits.length === 0) {
  console.log(`Retired vocabulary: no hits across ${files.length} files.`);
  process.exit(0);
}

const byTerm = new Map();
for (const hit of hits) {
  if (!byTerm.has(hit.term)) byTerm.set(hit.term, []);
  byTerm.get(hit.term).push(hit);
}

console.log(
  `Retired vocabulary: ${fatal.length} fatal and ${scheduled} report-only file/term hit(s) across ${files.length} files` +
    `${strict ? '' : ' (report mode; --strict exits 1 on fatal hits)'}.\n`,
);
for (const [term, list] of byTerm) {
  console.log(list[0].fatal ? `  ${term}` : `  (report only) ${term}`);
  for (const hit of list.sort((a, b) => a.rel.localeCompare(b.rel))) {
    console.log(`    ${String(hit.count).padStart(3)}  ${hit.rel}`);
  }
}

console.log(`\n${fatal.length} fatal, ${scheduled} scheduled.`);
process.exit(strict && fatal.length > 0 ? 1 : 0);
