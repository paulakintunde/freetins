/**
 * Tally reader reports for one day, and take upgrade trigger 1's reading.
 *
 * Reader reports are stored one key per (day, entry, reader): the key is
 * `hb:<day>:<entryId>:<fingerprint>` and the value is the verdict
 * (src/lib/code-reports.ts). Nothing on the request path ever holds a count, and
 * no count is displayed to a reader. Counts exist only here, on the aggregation
 * path, which is where an editor works the re-check queue.
 *
 * Two things this answers.
 *
 *   1. Which entries an editor should look at first. Per-entry totals, ordered by
 *      the `needsRecheck` verdict imported from the same module the queue uses, so
 *      the rule lives in one place rather than two.
 *   2. Upgrade trigger 1 of docs/adr/0005-the-free-plan-is-the-design-target.md:
 *      accepted hearts exceeding 500 in a day, half the free plan's account-wide
 *      1,000 KV writes a day, on seven consecutive days. That trigger was written
 *      as a reading with no way to take it. This is the way to take it.
 *
 * It reads. It never writes, and it never changes a state: only an editor event
 * does that (docs/adr/0004-every-article-gets-a-pass.md).
 *
 * Cost, on the day it is run: one KV list per page of keys and one KV read per
 * vote record, against budgets of 1,000 lists and 100,000 reads a day. At the
 * write cap of 1,000 votes a day a full pass is 1,000 reads, spent once, by one
 * person, on purpose.
 *
 * Usage:
 *   pnpm queue:hearts                             today (UTC), every entry
 *   pnpm queue:hearts --day 2026-08-25            one earlier day, within the TTL
 *   pnpm queue:hearts --entry <id>                one entry on that day
 *   pnpm queue:hearts --namespace-id <id>         while the binding is commented out
 *   pnpm queue:hearts --binding REPORTS           once wrangler.toml carries it
 *   pnpm queue:hearts --json                      machine-readable, same numbers
 *   pnpm queue:hearts --local --persist-to <dir>  a local store, for a rehearsal
 *
 * Records live for DEDUPE_TTL_SECONDS (seven days), so a --day older than that
 * returns nothing because the records expired, not because nobody voted.
 *
 * It needs `wrangler` authenticated against the account that owns the namespace:
 * `wrangler login`, or CLOUDFLARE_API_TOKEN in the environment. When it is not,
 * the script says so and stops rather than reporting an empty day as a quiet zero.
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEDUPE_TTL_SECONDS,
  RECHECK_FAILURE_RATIO,
  RECHECK_MIN_REPORTS,
  isVerdict,
  needsRecheck,
  voteDay,
  votePrefix,
} from '../src/lib/code-reports.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRANGLER = path.join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

/** Trigger 1 reads true above this many accepted reports in a day, seven days running. */
const TRIGGER_ONE_PER_DAY = 500;
/** The free plan's account-wide KV write budget, which is what a report spends. */
const WRITE_BUDGET_PER_DAY = 1000;

/** A fingerprint is 32 hex characters, and that is what makes a key parseable. */
const FINGERPRINT = /^[0-9a-f]{32}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `wrangler kv bulk get` takes a file of key names. Cloudflare's bulk read endpoint
 * is documented at 100 keys a request, so the batches are cut here rather than left
 * to the API to refuse.
 */
const BULK_BATCH = 100;

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const fail = (message, code = 1) => {
  console.error(message);
  process.exit(code);
};

const parseArgs = (argv) => {
  const options = {
    day: voteDay(),
    entry: undefined,
    binding: undefined,
    namespaceId: undefined,
    json: false,
    preview: false,
    local: false,
    persistTo: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith('--')) fail(`${arg} needs a value.`);
      index += 1;
      return next;
    };

    if (arg === '--json') options.json = true;
    else if (arg === '--preview') options.preview = true;
    else if (arg === '--local') options.local = true;
    else if (arg === '--persist-to') options.persistTo = value();
    else if (arg === '--day') options.day = value();
    else if (arg === '--entry') options.entry = value();
    else if (arg === '--binding') options.binding = value();
    else if (arg === '--namespace-id') options.namespaceId = value();
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: pnpm queue:hearts [--day YYYY-MM-DD] [--entry <id>]');
      console.log('       [--binding REPORTS | --namespace-id <id>] [--preview] [--json]');
      console.log('       [--local [--persist-to <dir>]]');
      process.exit(0);
    } else fail(`Unknown argument ${arg}. Run with --help.`);
  }

  if (!DAY.test(options.day)) fail(`--day must be YYYY-MM-DD, not ${options.day}.`);
  if (options.binding && options.namespaceId) {
    fail('Pass --binding or --namespace-id, not both.');
  }
  if (!options.binding && !options.namespaceId) options.binding = 'REPORTS';
  return options;
};

const options = parseArgs(process.argv.slice(2));
const namespaceArgs = options.binding
  ? ['--binding', options.binding]
  : ['--namespace-id', options.namespaceId];
if (options.preview) namespaceArgs.push('--preview');
// wrangler's kv commands default to the local store, so the real namespace has to be
// asked for explicitly. --local exists so the aggregation can be rehearsed offline.
if (options.local) {
  namespaceArgs.push('--local');
  if (options.persistTo) namespaceArgs.push('--persist-to', options.persistTo);
} else {
  namespaceArgs.push('--remote');
}

// ---------------------------------------------------------------------------
// Talking to wrangler
// ---------------------------------------------------------------------------

/**
 * Run wrangler through node against its own entry point rather than the shim in
 * node_modules/.bin, which is a .cmd on Windows and cannot be spawned without a
 * shell. stdin is closed and stdout is a pipe, so wrangler sees a non-interactive
 * terminal and reports a missing login instead of trying to open a browser.
 */
const runWrangler = (args) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [WRANGLER, ...args], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => resolve({ code: -1, stdout, stderr: String(error) }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });

/** The messages wrangler gives when it has no credentials, in any of its wordings. */
const looksUnauthenticated = (text) =>
  /not (?:logged in|authenticated)|CLOUDFLARE_API_TOKEN|wrangler login|Authentication error|\[code: 10000\]/i.test(
    text,
  );

const looksLikeMissingNamespace = (text) =>
  /binding.*not found|Could not find.*(?:namespace|binding)|no KV namespaces|kv_namespaces/i.test(
    text,
  );

const explain = (label, result) => {
  const text = `${result.stderr}\n${result.stdout}`;
  if (result.code === -1 || !existsSync(WRANGLER)) {
    fail(
      `wrangler could not be started. Run \`pnpm install\`, then try again.\n${result.stderr}`,
      2,
    );
  }
  if (looksUnauthenticated(text)) {
    fail(
      [
        'wrangler is not authenticated, so the namespace could not be read.',
        'Run `wrangler login`, or put a valid CLOUDFLARE_API_TOKEN in the environment, then run this again.',
        'Nothing is reported until it can be read: an unread day is not a day with no reports.',
      ].join('\n'),
      2,
    );
  }
  if (options.binding && looksLikeMissingNamespace(text)) {
    fail(
      [
        `wrangler could not resolve the ${options.binding} binding from wrangler.toml.`,
        'The REPORTS binding ships commented out. Either uncomment it once the namespace exists,',
        'or pass the namespace id directly: pnpm queue:hearts --namespace-id <id>.',
      ].join('\n'),
      2,
    );
  }
  fail(`${label} failed (exit ${result.code}).\n${text.trim()}`, 2);
};

const parseJson = (label, text) => {
  // Wrangler prints its JSON payload after any banner or warning lines.
  const start = text.search(/[[{]/);
  if (start === -1) fail(`${label} returned no JSON.\n${text.trim()}`, 2);
  try {
    return JSON.parse(text.slice(start));
  } catch (error) {
    fail(`${label} returned JSON this script could not read: ${String(error)}`, 2);
    return undefined;
  }
};

// ---------------------------------------------------------------------------
// Reading the day
// ---------------------------------------------------------------------------

const listKeys = async (prefix) => {
  const result = await runWrangler([
    'kv',
    'key',
    'list',
    ...namespaceArgs,
    '--prefix',
    prefix,
  ]);
  if (result.code !== 0) explain('wrangler kv key list', result);
  const payload = parseJson('wrangler kv key list', result.stdout);
  if (!Array.isArray(payload)) fail('wrangler kv key list did not return a list.', 2);
  return payload.map((item) => (typeof item === 'string' ? item : item?.name)).filter(Boolean);
};

/** One bulk read per 100 keys, falling back to one read per key if bulk is refused. */
const readValues = async (names) => {
  const values = new Map();
  if (names.length === 0) return values;

  const directory = await mkdtemp(path.join(tmpdir(), 'freetins-hearts-'));
  let bulkWorks = true;
  try {
    for (let index = 0; index < names.length; index += BULK_BATCH) {
      const batch = names.slice(index, index + BULK_BATCH);
      if (bulkWorks) {
        const file = path.join(directory, `batch-${index}.json`);
        await writeFile(file, JSON.stringify(batch), 'utf8');
        const result = await runWrangler(['kv', 'bulk', 'get', file, ...namespaceArgs]);
        if (result.code === 0) {
          const payload = parseJson('wrangler kv bulk get', result.stdout) ?? {};
          for (const [name, entry] of Object.entries(payload)) {
            const value = typeof entry === 'string' ? entry : entry?.value;
            if (typeof value === 'string') values.set(name, value);
          }
          continue;
        }
        if (looksUnauthenticated(`${result.stderr}${result.stdout}`)) {
          explain('wrangler kv bulk get', result);
        }
        // `kv bulk get` is an open-beta command. If it is not there, one read per
        // key gets the same numbers, slowly, and says so once rather than failing.
        bulkWorks = false;
        console.error(
          `wrangler kv bulk get was refused, so values are being read one key at a time (${names.length} reads).`,
        );
      }
      for (const name of batch) {
        const result = await runWrangler(['kv', 'key', 'get', name, ...namespaceArgs]);
        if (result.code !== 0) explain('wrangler kv key get', result);
        values.set(name, result.stdout.trim());
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
  return values;
};

/**
 * `hb:<day>:<entryId>:<fingerprint>`, read right to left because an entry id may
 * contain `:` and so cannot be found by splitting. A name whose last segment is not
 * a 32-character fingerprint is not a vote record and is counted as skipped, never
 * guessed at.
 */
const parseVoteKey = (name, day) => {
  const prefix = votePrefix(day);
  if (!name.startsWith(prefix)) return null;
  const rest = name.slice(prefix.length);
  if (rest.length < 34) return null;
  const print = rest.slice(-32);
  if (rest[rest.length - 33] !== ':' || !FINGERPRINT.test(print)) return null;
  const entryId = rest.slice(0, -33);
  return entryId ? { entryId, print } : null;
};

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

const prefix = votePrefix(options.day, options.entry);
const names = await listKeys(prefix);

let skipped = 0;
let foreign = 0;
const parsed = [];
for (const name of names) {
  const record = parseVoteKey(name, options.day);
  if (!record) {
    skipped += 1;
    continue;
  }
  // A prefix is a string match, and an entry id may contain `:`, so `--entry a:b`
  // also lists every key belonging to `a:b:c`. Those are a different entry's votes.
  if (options.entry && record.entryId !== options.entry) {
    foreign += 1;
    continue;
  }
  parsed.push({ name, entryId: record.entryId });
}

const values = await readValues(parsed.map((record) => record.name));

const totals = new Map();
let unreadable = 0;
for (const record of parsed) {
  const verdict = values.get(record.name);
  if (!isVerdict(verdict)) {
    unreadable += 1;
    continue;
  }
  const counts = totals.get(record.entryId) ?? { worked: 0, failed: 0 };
  counts[verdict] += 1;
  totals.set(record.entryId, counts);
}

const rows = [...totals.entries()]
  .map(([entry, counts]) => ({
    entry,
    worked: counts.worked,
    failed: counts.failed,
    total: counts.worked + counts.failed,
    needsRecheck: needsRecheck(counts),
  }))
  .sort(
    (a, b) =>
      Number(b.needsRecheck) - Number(a.needsRecheck) ||
      b.failed - a.failed ||
      b.total - a.total ||
      a.entry.localeCompare(b.entry),
  );

const accepted = rows.reduce((sum, row) => sum + row.total, 0);

if (options.json) {
  console.log(
    JSON.stringify(
      {
        day: options.day,
        prefix,
        namespace: options.binding ? { binding: options.binding } : { id: options.namespaceId },
        records: { counted: accepted, unreadable, skipped, foreign },
        triggerOne: { threshold: TRIGGER_ONE_PER_DAY, reads: accepted },
        entries: rows,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const label = options.entry ? ` entry ${options.entry}` : '';
console.log(`Reader reports for ${options.day}${label} — prefix ${prefix}`);
console.log('');

if (rows.length === 0) {
  console.log('No reports stored for that day.');
  const ttlDays = DEDUPE_TTL_SECONDS / 86400;
  console.log(
    `Records expire after ${ttlDays} days, so an older day reads empty because it expired.`,
  );
} else {
  const width = Math.max(5, ...rows.map((row) => row.entry.length));
  console.log(
    `${'entry'.padEnd(width)}  ${'worked'.padStart(6)}  ${'failed'.padStart(6)}  ${'total'.padStart(5)}  needsRecheck`,
  );
  for (const row of rows) {
    console.log(
      `${row.entry.padEnd(width)}  ${String(row.worked).padStart(6)}  ${String(row.failed).padStart(6)}  ${String(row.total).padStart(5)}  ${row.needsRecheck ? 'yes' : 'no'}`,
    );
  }
  console.log('');
  console.log(
    `needsRecheck is ${RECHECK_MIN_REPORTS} or more reports with a failure share of ${RECHECK_FAILURE_RATIO} or higher. It orders the editor queue and never changes a state.`,
  );
}

if (skipped > 0) {
  console.log(
    `${skipped} listed key(s) did not end in a 32-character fingerprint and were not counted.`,
  );
}
if (unreadable > 0) {
  console.log(`${unreadable} vote record(s) held a value that is not a verdict and were skipped.`);
}
if (foreign > 0) {
  console.log(
    `${foreign} record(s) under that prefix belong to entries whose id begins with ${options.entry}: and were not counted into it.`,
  );
}

console.log('');
console.log(
  `Upgrade trigger 1 (docs/adr/0005-the-free-plan-is-the-design-target.md): ${accepted} accepted report(s) on ${options.day}, against ${TRIGGER_ONE_PER_DAY} a day for seven consecutive days and a free-plan budget of ${WRITE_BUDGET_PER_DAY} KV writes a day.`,
);
if (accepted > TRIGGER_ONE_PER_DAY) {
  console.log(
    'That is one day over the threshold. The trigger needs seven consecutive days; run this for each of them before acting on it.',
  );
}
