import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import {
  DEDUPE_TTL_SECONDS,
  FINGERPRINT_HEX_LENGTH,
  KvWriteRefused,
  answerAvailability,
  answerReport,
  fingerprint,
  isEntryId,
  needsRecheck,
  readerReportsEnabled,
  recordVote,
  reportableEntryIds,
  tallyVotes,
  voteDay,
  voteKey,
  votePrefix,
} from '../src/lib/code-reports.ts';

/*
 * Reader reports run inside a fixed budget: 1,000 KV writes a day, account-wide, on
 * Cloudflare's free plan (docs/adr/0005). Four properties keep the feature inside it,
 * and each is invisible from the outside, so each is pinned here:
 *
 *   - the endpoint refuses entirely while `services.reports.enabled` is false, so
 *     binding the namespace does not open a write budget with no control on any page;
 *   - only an entry id this build published may become a key, so invented ids cannot
 *     spend the day's writes;
 *   - one accepted vote is exactly one write, and a repeat vote is none;
 *   - a refused write is an answer, not an exception, so the cap degrades into one
 *     honest line rather than a 500.
 *
 * Two more are about honesty rather than cost: a page view spends nothing at all,
 * because the control's visibility is a build-time decision and neither verb is called
 * on load; and what a reader is shown is the verdict the store holds, never the one
 * they just clicked when the two differ.
 *
 * Everything runs against the fake store below, and the route handler runs against a
 * stubbed `cloudflare:workers` and a fixture of the operational data. No network, no
 * KV, no Worker.
 */

const SECRET = 'test-secret-not-a-real-one';
const ADDRESS = '203.0.113.9';

/** The operational data as it ships, which is where the reportable ids come from. */
const OPERATIONS = JSON.parse(readFileSync('src/content/operations.json', 'utf8'));
const PUBLISHED = reportableEntryIds(OPERATIONS);

/** One entry a reader may actually report on, taken from the data rather than invented. */
const ENTRY = [...PUBLISHED][0];

/**
 * A ledger row id: the shape the charset was widened for, and deliberately NOT
 * reportable yet, because no dataset page renders the control.
 */
const ROW_ID = 'steal-a-brainrot-codes:codes:imanegg';

/** The day boundary is UTC, and these two Dates sit either side of one. */
const LATE = new Date('2026-08-26T23:30:00.000Z');
const NEXT = new Date('2026-08-27T00:10:00.000Z');

/** A fingerprint-shaped key suffix. The tally only counts keys whose suffix is one. */
const printOf = (n) => n.toString(16).padStart(FINGERPRINT_HEX_LENGTH, '0');

/**
 * An in-memory CodeReportStore. `puts` records every attempt, including refused ones,
 * so a test can tell "did not write" from "tried and was turned away". `pageSize` is
 * deliberately small so the aggregation path has to follow a cursor.
 */
class FakeReportStore {
  constructor({ rejectPut = null, rejectGet = null, pageSize = 2 } = {}) {
    this.values = new Map();
    this.ttls = new Map();
    this.puts = [];
    this.gets = [];
    this.lists = [];
    this.rejectPut = rejectPut;
    this.rejectGet = rejectGet;
    this.pageSize = pageSize;
  }

  async get(key, type) {
    this.gets.push(key);
    if (this.rejectGet) throw this.rejectGet;
    const value = this.values.has(key) ? this.values.get(key) : null;
    if (type === 'json') return value === null ? null : JSON.parse(value);
    return value;
  }

  async put(key, value, options = {}) {
    this.puts.push({ key, value, options });
    if (this.rejectPut) throw this.rejectPut;
    this.values.set(key, value);
    this.ttls.set(key, options.expirationTtl);
  }

  async list({ prefix, cursor }) {
    this.lists.push({ prefix, cursor });
    const names = [...this.values.keys()].filter((name) => name.startsWith(prefix)).sort();
    const start = cursor ? Number(cursor) : 0;
    const page = names.slice(start, start + this.pageSize);
    const end = start + page.length;
    const complete = end >= names.length;
    return {
      keys: page.map((name) => ({ name })),
      list_complete: complete,
      ...(complete ? {} : { cursor: String(end) }),
    };
  }
}

/** Configured: both bindings, the flag on, and the ids this build published. */
const bindingsFor = (store) => ({ store, secret: SECRET, enabled: true, reportable: PUBLISHED });

const report = (store, overrides = {}, now = LATE) =>
  answerReport(bindingsFor(store), { entry: ENTRY, verdict: 'worked', address: ADDRESS, ...overrides }, now);

// ---------------------------------------------------------------------------
// The route handler, loaded the way Node can load it
//
// src/pages/api/code-report.json.ts imports `cloudflare:workers`, which exists only
// inside a Worker, and `../../data/operations`, whose contents decide whether the
// endpoint answers at all. Both are resolved here: the first to a stub whose `env` the
// tests own, the second to a fixture, so the flag can be tested in both positions
// without editing the operational data. TypeScript's extensionless relative specifiers
// get the `.ts` Node's resolver insists on.
// ---------------------------------------------------------------------------

const ROUTE = new URL('../src/pages/api/code-report.json.ts', import.meta.url);

/** The `env` the stubbed binding module exports. Tests set the bindings on it directly. */
const workerEnv = {};
globalThis.__freetinsWorkerEnv = workerEnv;

let operationsFixture = null;

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'cloudflare:workers') {
      return {
        url: 'data:text/javascript,export const env = globalThis.__freetinsWorkerEnv;',
        shortCircuit: true,
      };
    }
    if (operationsFixture && specifier.endsWith('/data/operations')) {
      const source = `export const operations = JSON.parse(${JSON.stringify(JSON.stringify(operationsFixture))});`;
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    }
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s(on)?$/.test(specifier)) {
      return next(`${specifier}.ts`, context);
    }
    return next(specifier, context);
  },
});

/** Operational data with nothing in it but what the endpoint reads. */
const fixtureOperations = (enabled) => ({
  services: { reports: { enabled } },
  codes: [{ id: 'fixture-game-code-1' }, { id: 'fixture-game-code-2' }],
  dailyLinks: [{ id: 'fixture-game-link-1' }],
  cheats: [],
});

const FIXTURE_ENTRY = 'fixture-game-code-1';

/**
 * One route module per fixture. The query string is what gives each its own module
 * instance; the lib they share resolves without one, so there is only ever one of it.
 */
const loadRoute = async (enabled, variant) => {
  operationsFixture = fixtureOperations(enabled);
  try {
    return await import(`${ROUTE.href}?variant=${variant}`);
  } finally {
    operationsFixture = null;
  }
};

const routeOn = await loadRoute(true, 'enabled');
const routeOff = await loadRoute(false, 'disabled');

/** And one more with no fixture at all: the real src/data/operations.ts, as it ships. */
const routeAsShipped = await import(`${ROUTE.href}?variant=as-shipped`);

const postTo = (route, { body, raw, address = ADDRESS } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (address) headers['CF-Connecting-IP'] = address;
  return route.POST({
    request: new Request('https://www.freetins.com/api/code-report.json', {
      method: 'POST',
      headers,
      body: raw === undefined ? JSON.stringify(body) : raw,
    }),
  });
};

/** Bindings present and working, unless a test says otherwise. */
const bindTheStore = (store) => {
  workerEnv.REPORTS = store;
  workerEnv.REPORT_SECRET = SECRET;
  return store;
};

// ---------------------------------------------------------------------------
// The key
// ---------------------------------------------------------------------------

test('a vote key names the day, the entry and the fingerprint, in that order', () => {
  assert.equal(voteKey('2026-08-26', ENTRY, 'abc123'), `hb:2026-08-26:${ENTRY}:abc123`);
});

test('a vote key is always its own prefix plus the fingerprint', () => {
  // Entry ids may contain colons themselves, so a key cannot be split back into fields.
  // Listing works only because this identity holds; if it broke, a tally would either
  // miss votes or count another entry's.
  const day = '2026-08-26';
  assert.equal(voteKey(day, ROW_ID, 'abc123'), `${votePrefix(day, ROW_ID)}abc123`);
  assert.ok(votePrefix(day, ROW_ID).startsWith(votePrefix(day)));
  assert.ok(votePrefix(day).startsWith(votePrefix()));
  assert.equal(votePrefix(), 'hb:');
  assert.equal(votePrefix(day), 'hb:2026-08-26:');
});

test('the day is the UTC day, whatever the machine thinks the date is', () => {
  // The key and the HMAC both take their day from voteDay. If it read local time the
  // two could disagree either side of midnight and a reader would be able to vote twice.
  assert.equal(voteDay(LATE), '2026-08-26');
  assert.equal(voteDay(NEXT), '2026-08-27');
});

test('the same reader on the same code gets a different key the next day', async () => {
  const [today, tomorrow] = await Promise.all([
    fingerprint(ADDRESS, ENTRY, SECRET, LATE),
    fingerprint(ADDRESS, ENTRY, SECRET, NEXT),
  ]);
  assert.notEqual(today, tomorrow, 'the fingerprint must rotate daily or it is linkable');
  assert.notEqual(voteKey(voteDay(LATE), ENTRY, today), voteKey(voteDay(NEXT), ENTRY, tomorrow));
});

test('the fingerprint hides the address and stays stable within a day', async () => {
  const print = await fingerprint(ADDRESS, ENTRY, SECRET, LATE);
  assert.match(print, /^[0-9a-f]{32}$/);
  assert.equal(print.length, FINGERPRINT_HEX_LENGTH, 'the tally reads this exact width');
  assert.ok(!print.includes(ADDRESS));
  assert.equal(print, await fingerprint(ADDRESS, ENTRY, SECRET, new Date('2026-08-26T00:00:01.000Z')));
  assert.notEqual(print, await fingerprint('198.51.100.4', ENTRY, SECRET, LATE));
  assert.notEqual(print, await fingerprint(ADDRESS, 'other-game-codes:codes:x', SECRET, LATE));
});

// ---------------------------------------------------------------------------
// One accepted vote, one write
// ---------------------------------------------------------------------------

test('an accepted vote is one write, at the vote key, holding the verdict', async () => {
  const store = new FakeReportStore();
  const answer = await report(store, { verdict: 'failed' });

  assert.deepEqual(answer, { status: 200, body: { accepted: true, counted: true, verdict: 'failed' } });
  assert.equal(store.puts.length, 1);

  const print = await fingerprint(ADDRESS, ENTRY, SECRET, LATE);
  const key = voteKey('2026-08-26', ENTRY, print);
  assert.equal(store.puts[0].key, key);
  assert.equal(store.values.get(key), 'failed');
  assert.equal(store.ttls.get(key), DEDUPE_TTL_SECONDS);
});

test('a second identical report writes nothing', async () => {
  const store = new FakeReportStore();
  const first = await report(store);
  const second = await report(store);

  assert.deepEqual(first.body, { accepted: true, counted: true, verdict: 'worked' });
  assert.deepEqual(second.body, { accepted: true, counted: false, verdict: 'worked' });
  assert.equal(second.status, 200, 'a repeat is a normal answer, not an error');
  assert.equal(store.puts.length, 1, 'the second report must not reach the write budget');
  assert.equal(store.values.size, 1);
});

test('changing your mind on the same day answers with the vote on record', async () => {
  // The key is (day, entry, fingerprint) and holds the verdict; the vote is not
  // re-openable. One vote per reader, per code, per day, and the first one stands —
  // so the answer carries the stored verdict and the client paints that, not the
  // thumb just pressed. Painting the new one showed a report that was never stored.
  const store = new FakeReportStore();
  await report(store, { verdict: 'worked' });
  const second = await report(store, { verdict: 'failed' });

  assert.deepEqual(second.body, { accepted: true, counted: false, verdict: 'worked' });
  assert.equal(store.puts.length, 1);
  assert.equal([...store.values.values()][0], 'worked');
});

test('a stored value that is not a verdict falls back to the one submitted', async () => {
  // Nothing writes anything but a verdict, so this is a corrupted record rather than a
  // state the code produces. The answer must still be a verdict the client can paint.
  const store = new FakeReportStore();
  const print = await fingerprint(ADDRESS, ENTRY, SECRET, LATE);
  await store.put(voteKey('2026-08-26', ENTRY, print), 'something-else');

  const answer = await report(store, { verdict: 'failed' });
  assert.deepEqual(answer.body, { accepted: true, counted: false, verdict: 'failed' });
  assert.equal(store.puts.length, 1, 'the seeded put only; the report itself wrote nothing');
});

test('the same reader may vote again tomorrow, and that is a second key', async () => {
  const store = new FakeReportStore();
  const today = await report(store, {}, LATE);
  const tomorrow = await report(store, {}, NEXT);

  assert.deepEqual(today.body, { accepted: true, counted: true, verdict: 'worked' });
  assert.deepEqual(tomorrow.body, { accepted: true, counted: true, verdict: 'worked' });
  assert.equal(store.values.size, 2);
  const days = [...store.values.keys()].map((key) => key.split(':')[1]).sort();
  assert.deepEqual(days, ['2026-08-26', '2026-08-27']);
});

test('two readers on one code write two keys and never race', async () => {
  // The old model read a counter, incremented it and wrote it back, so concurrent
  // votes lost one. Here each reader owns a distinct key, so concurrency is not a
  // failure mode at all.
  const store = new FakeReportStore();
  const [a, b] = await Promise.all([
    report(store, { address: '203.0.113.9' }),
    report(store, { address: '198.51.100.4', verdict: 'failed' }),
  ]);

  assert.equal(a.body.counted, true);
  assert.equal(b.body.counted, true);
  assert.equal(store.values.size, 2);
  assert.deepEqual([...store.values.values()].sort(), ['failed', 'worked']);
});

// ---------------------------------------------------------------------------
// What may become a key: the charset, then the manifest
// ---------------------------------------------------------------------------

test('the charset accepts a derived ledger row id', async () => {
  // `<slug>:<table>:<name>` is what the ledger derives. The regex this replaced was
  // /^[a-z0-9-]+$/, which rejected every one of them. The charset is the cheap first
  // pass only: membership below is what decides whether a key may be written.
  assert.ok(isEntryId(ROW_ID));
  assert.ok(isEntryId('shindo-life-codes'));
  assert.ok(isEntryId('a/b_c.d-e:f'));
  assert.ok(isEntryId('a'.repeat(128)), 'the cap is 128 characters, inclusive');
});

test('the charset rejects a path-traversal id, and writes nothing', async () => {
  assert.equal(isEntryId('../../etc/passwd'), false, 'a leading dot is not a legal first character');
  assert.equal(isEntryId('codes/../../etc/passwd'), false, 'nor is `..` anywhere in an id');

  const store = new FakeReportStore();
  const answer = await report(store, { entry: '../../etc/passwd' });
  assert.equal(answer.status, 400);
  assert.deepEqual(answer.body, { error: 'Invalid entry id.' });
  assert.equal(store.puts.length, 0);
  assert.equal(store.gets.length, 0, 'a rejected id must not even cost a read');
});

test('the charset rejects an overlong id rather than truncating it into another', async () => {
  // Truncating would turn one reader's bad id into a valid id for some other entry.
  const overlong = 'a'.repeat(129);
  assert.equal(isEntryId(overlong), false);

  const store = new FakeReportStore();
  const answer = await report(store, { entry: overlong });
  assert.equal(answer.status, 400);
  assert.equal(store.puts.length, 0);
});

test('the charset rejects the shapes an id never has', async () => {
  for (const value of ['', 'UPPER-CASE', '-leading-dash', ':leading-colon', 'has space', 'emoji-🙂', 42, null, undefined, {}]) {
    assert.equal(isEntryId(value), false, `${String(value)} must not be usable as a key`);
  }
});

test('the reportable ids are the entries this build published, and nothing else', () => {
  // Derived from the operational data at build time. Without it the charset alone
  // bounds the namespace, and a thousand POSTs carrying invented ids spend the
  // account's whole daily write budget on records no editor will ever read.
  const codeIds = OPERATIONS.codes.map((entry) => entry.id);
  const expected = codeIds.length
    + OPERATIONS.dailyLinks.length
    + OPERATIONS.cheats.length;

  assert.ok(PUBLISHED.size > 0, 'an empty set would refuse every report on the site');
  assert.equal(PUBLISHED.size, expected, 'codes, daily links and cheats, all of them');
  assert.ok(PUBLISHED.has(codeIds[0]));
  for (const id of PUBLISHED) assert.ok(isEntryId(id), `${id} is in the set and must be writable`);
});

test('a dataset row id is not reportable, however well formed it is', async () => {
  // Dataset pages render no report control. An id of that shape is a stale client or an
  // invented key; it passes the charset, which is exactly why the charset is not enough.
  assert.ok(isEntryId(ROW_ID), 'well formed');
  assert.equal(PUBLISHED.has(ROW_ID), false, 'and still not reportable');

  const store = new FakeReportStore();
  const answer = await report(store, { entry: ROW_ID });
  assert.equal(answer.status, 400);
  assert.deepEqual(answer.body, { error: 'Invalid entry id.' }, 'the same answer as a malformed id');
  assert.equal(store.puts.length, 0, 'an unknown id must not reach the write budget');
  assert.equal(store.gets.length, 0, 'nor cost a read, nor a fingerprint');
});

test('an invented id in the right shape is refused too', async () => {
  const store = new FakeReportStore();
  const answer = await report(store, { entry: 'not-a-published-entry-id' });
  assert.equal(answer.status, 400);
  assert.equal(store.puts.length, 0);
});

test('an empty reportable set accepts nothing at all', async () => {
  // A build that derived no ids must refuse rather than fall open.
  const store = new FakeReportStore();
  const answer = await answerReport(
    { store, secret: SECRET, enabled: true, reportable: new Set() },
    { entry: ENTRY, verdict: 'worked', address: ADDRESS },
    LATE,
  );
  assert.equal(answer.status, 400);
  assert.equal(store.puts.length, 0);
});

test('a verdict that is not worked or failed is refused, and so is a missing address', async () => {
  const store = new FakeReportStore();
  assert.deepEqual(
    await report(store, { verdict: 'maybe' }),
    { status: 400, body: { error: 'Verdict must be worked or failed.' } },
  );
  assert.deepEqual(
    await report(store, { address: null }),
    { status: 400, body: { error: 'Report could not be attributed.' } },
  );
  assert.equal(store.puts.length, 0);
});

// ---------------------------------------------------------------------------
// The write budget
// ---------------------------------------------------------------------------

test('a store that refuses the write answers 429 and never throws', async () => {
  const store = new FakeReportStore({ rejectPut: new Error('KV PUT failed: 429 Too Many Requests') });
  const answer = await report(store);

  assert.equal(answer.status, 429);
  assert.deepEqual(answer.body, { accepted: false, reason: 'paused' });
  assert.equal(store.puts.length, 1, 'the write was attempted');
  assert.equal(store.values.size, 0, 'and nothing was stored');
});

test('the answer carries the refusal so the endpoint can log which kind it was', async () => {
  const quota = await report(new FakeReportStore({ rejectPut: new Error('limit exceeded') }));
  assert.ok(quota.refusal instanceof KvWriteRefused);
  assert.equal(quota.refusal.quota, true);

  const fault = await report(new FakeReportStore({ rejectPut: new TypeError('boom') }));
  assert.equal(fault.refusal.quota, false);

  const fine = await report(new FakeReportStore());
  assert.equal(fine.refusal, undefined, 'nothing to log when nothing was refused');
});

test('a refusal is classified so a quota is never read as a bug', async () => {
  const quota = await recordVote(
    new FakeReportStore({ rejectPut: new Error('KV PUT failed: 429 Too Many Requests') }),
    'hb:2026-08-26:x:y',
    'worked',
  );
  assert.equal(quota.status, 'refused');
  assert.ok(quota.refusal instanceof KvWriteRefused);
  assert.equal(quota.refusal.quota, true);

  const fault = await recordVote(
    new FakeReportStore({ rejectPut: new TypeError('store.put is not a function') }),
    'hb:2026-08-26:x:y',
    'worked',
  );
  assert.equal(fault.status, 'refused');
  assert.equal(fault.refusal.quota, false, 'a bug must not be filed as a quota refusal');
  assert.equal(fault.refusal.cause?.name, 'TypeError', 'the original is kept for the log');
});

test('a bug in the store is still answered as 429, because a reader cannot act on the difference', async () => {
  const store = new FakeReportStore({ rejectPut: new TypeError('boom') });
  const answer = await report(store);
  assert.equal(answer.status, 429);
  assert.deepEqual(answer.body, { accepted: false, reason: 'paused' });
});

test('a read that fails costs at most one redundant write, never a lost vote', async () => {
  const store = new FakeReportStore({ rejectGet: new Error('KV GET failed: 500') });
  const answer = await report(store);
  assert.deepEqual(answer.body, { accepted: true, counted: true, verdict: 'worked' });
  assert.equal(store.puts.length, 1);
});

// ---------------------------------------------------------------------------
// Both bindings, the flag, both verbs
// ---------------------------------------------------------------------------

test('GET answers configuration and nothing else', () => {
  const answer = answerAvailability(bindingsFor(new FakeReportStore()));
  assert.equal(answer.status, 200);
  assert.deepEqual(Object.keys(answer.body), ['available'], 'no counts, and therefore no KV read');
  assert.equal(answer.body.available, true);
});

test('GET refuses when either binding is absent, or the flag is off', () => {
  const refused = { available: false, reason: 'Reader reports are not configured.' };
  const store = new FakeReportStore();
  const base = { store, secret: SECRET, enabled: true, reportable: PUBLISHED };

  assert.deepEqual(answerAvailability({ ...base, store: undefined }), { status: 503, body: refused });
  assert.deepEqual(answerAvailability({ ...base, secret: undefined }), { status: 503, body: refused });
  assert.deepEqual(answerAvailability({ ...base, secret: '' }), { status: 503, body: refused });
  assert.deepEqual(answerAvailability({ ...base, enabled: false }), { status: 503, body: refused });
  assert.equal(store.gets.length, 0);
});

test('POST refuses when either binding is absent, or the flag is off, and writes nothing', async () => {
  const refused = { available: false, reason: 'Reader reports are not configured.' };
  const store = new FakeReportStore();
  const base = { store, secret: SECRET, enabled: true, reportable: PUBLISHED };
  const submission = { entry: ENTRY, verdict: 'worked', address: ADDRESS };

  assert.deepEqual(
    await answerReport({ ...base, store: undefined }, submission, LATE),
    { status: 503, body: refused },
  );
  // Without the secret the fingerprint would be reversible from the small IPv4 space,
  // so a bound namespace and no secret must refuse rather than store a weaker key.
  assert.deepEqual(
    await answerReport({ ...base, secret: undefined }, submission, LATE),
    { status: 503, body: refused },
  );
  // And with both bindings present, the flag still decides. Until this was read, the
  // write budget was live the moment the namespace existed, with no control anywhere.
  assert.deepEqual(
    await answerReport({ ...base, enabled: false }, submission, LATE),
    { status: 503, body: refused },
  );
  assert.equal(store.puts.length, 0);
  assert.equal(store.gets.length, 0);
});

// ---------------------------------------------------------------------------
// The route handler
// ---------------------------------------------------------------------------

test('the flag gates the route itself, on both verbs, before the body is read', async () => {
  const store = bindTheStore(new FakeReportStore());

  const get = await routeOff.GET({});
  assert.equal(get.status, 503);
  assert.deepEqual(await get.json(), { available: false, reason: 'Reader reports are not configured.' });

  const post = await postTo(routeOff, { body: { entry: FIXTURE_ENTRY, verdict: 'worked' } });
  assert.equal(post.status, 503);
  assert.deepEqual(await post.json(), { available: false, reason: 'Reader reports are not configured.' });
  assert.equal(store.gets.length, 0, 'a disabled endpoint touches the store for nothing');
  assert.equal(store.puts.length, 0);
});

test('the route answers from the operational data as it actually ships', async () => {
  // The fixtures above prove the flag is read; this proves it is read from the file the
  // site ships, rather than hardcoded on. It states no expectation of its own about the
  // flag's value, so flipping it in the data changes what this asserts and never breaks it.
  bindTheStore(new FakeReportStore());
  const expected = readerReportsEnabled(OPERATIONS) ? 200 : 503;

  const get = await routeAsShipped.GET({});
  assert.equal(get.status, expected, 'GET follows services.reports.enabled');

  const post = await postTo(routeAsShipped, { body: { entry: ENTRY, verdict: 'worked' } });
  assert.notEqual(post.status, 500, 'and never throws either way');
  if (expected === 503) assert.equal(post.status, 503);
});

test('with the flag on, the route records a vote and says what it holds', async () => {
  const store = bindTheStore(new FakeReportStore());

  const get = await routeOn.GET({});
  assert.equal(get.status, 200);
  assert.deepEqual(await get.json(), { available: true });
  assert.equal(get.headers.get('Cache-Control'), 'no-store, max-age=0');
  assert.equal(get.headers.get('X-Robots-Tag'), 'noindex, nofollow');

  const first = await postTo(routeOn, { body: { entry: FIXTURE_ENTRY, verdict: 'failed' } });
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { accepted: true, counted: true, verdict: 'failed' });
  assert.equal(store.puts.length, 1);
  assert.match(store.puts[0].key, new RegExp(`^hb:\\d{4}-\\d{2}-\\d{2}:${FIXTURE_ENTRY}:[0-9a-f]{32}$`));

  const again = await postTo(routeOn, { body: { entry: FIXTURE_ENTRY, verdict: 'worked' } });
  assert.deepEqual(await again.json(), { accepted: true, counted: false, verdict: 'failed' }, 'the stored one');
  assert.equal(store.puts.length, 1, 'and no second write');
});

test('a JSON null body is a 400, not a 500', async () => {
  // `JSON.parse('null')` does not throw, so the parse succeeded and reading `.entry`
  // off null threw a TypeError that surfaced to the reader as a 500.
  const store = bindTheStore(new FakeReportStore());

  for (const raw of ['null', '42', '"worked"', '[]', 'not json at all', '']) {
    const response = await postTo(routeOn, { raw });
    assert.equal(response.status, 400, `${raw || '(empty body)'} must be a 400`);
    assert.deepEqual(await response.json(), { error: 'Body must be JSON.' });
  }
  assert.equal(store.puts.length, 0);
  assert.equal(store.gets.length, 0);
});

test('the route refuses an id this build did not publish', async () => {
  const store = bindTheStore(new FakeReportStore());

  const response = await postTo(routeOn, { body: { entry: ROW_ID, verdict: 'worked' } });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid entry id.' });
  assert.equal(store.puts.length, 0);
});

test('the route refuses when the bindings are missing, whatever the flag says', async () => {
  delete workerEnv.REPORTS;
  delete workerEnv.REPORT_SECRET;

  const get = await routeOn.GET({});
  assert.equal(get.status, 503);

  const post = await postTo(routeOn, { body: { entry: FIXTURE_ENTRY, verdict: 'worked' } });
  assert.equal(post.status, 503);

  bindTheStore(new FakeReportStore());
  workerEnv.REPORT_SECRET = undefined;
  const half = await routeOn.GET({});
  assert.equal(half.status, 503, 'a namespace with no secret is not configured');
});

test('the route logs which kind of refusal it answered 429 with', async () => {
  // A spent write budget and a broken binding both answer 429. Without this line they
  // are indistinguishable in production, and the ADR's first upgrade trigger is a guess.
  bindTheStore(new FakeReportStore({ rejectPut: new Error('KV PUT failed: 429 limit exceeded') }));
  const logged = [];
  const original = console.error;
  console.error = (...args) => logged.push(args);

  try {
    const response = await postTo(routeOn, { body: { entry: 'fixture-game-code-2', verdict: 'worked' } });
    assert.equal(response.status, 429);
    assert.deepEqual(await response.json(), { accepted: false, reason: 'paused' }, 'the reader learns nothing new');
  } finally {
    console.error = original;
  }

  assert.equal(logged.length, 1);
  assert.equal(logged[0][0], 'code-report write refused');
  assert.equal(logged[0][1].quota, true);
  assert.match(logged[0][1].cause, /limit exceeded/);
});

test('a request with no CF-Connecting-IP is refused rather than counted', async () => {
  const store = bindTheStore(new FakeReportStore());
  const response = await postTo(routeOn, { body: { entry: FIXTURE_ENTRY, verdict: 'worked' }, address: null });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Report could not be attributed.' });
  assert.equal(store.puts.length, 0);
});

// ---------------------------------------------------------------------------
// What a page view costs, and what the client shows
// ---------------------------------------------------------------------------

test('a page view spends nothing: the client fetches only on a click', () => {
  const client = readFileSync('src/scripts/code-reports.ts', 'utf8');
  const fetches = client.match(/fetch\(/g) ?? [];
  assert.equal(fetches.length, 1, 'one fetch, inside send(), reached only from the click handler');
  assert.match(client, /addEventListener\('click'/);
  assert.doesNotMatch(client, /\?entry=/, 'the per-entry GET on load is gone');
  assert.match(client, /paintedBody === document\.body/, 'astro:page-load must not double-run the paint');
});

test('an answer that cannot change stops the page from asking again', () => {
  // 429 holds until 00:00 UTC and 503 until a deploy. Ten impatient clicks are ten
  // Function invocations that learn the same thing, which is the free plan's budget
  // spent on a state the reader has already been told about.
  const client = readFileSync('src/scripts/code-reports.ts', 'utf8');
  const handler = client.slice(client.indexOf("addEventListener('click'"));
  const shortCircuit = handler.indexOf('if (stopped)');
  const sends = handler.indexOf('void send(');

  assert.ok(shortCircuit > -1, 'the click handler checks the page-scoped stop');
  assert.ok(sends > -1);
  assert.ok(shortCircuit < sends, 'and checks it before it sends anything');
  assert.match(handler, /stopped = \{ line: UNAVAILABLE_LINE, retryable: false \}/);
  assert.match(handler, /stopped = \{ line: FAILURE_LINE, retryable: true \}/);

  // Only those two. A 400 means this one id is not reportable, and stopping the page
  // for it would tell a reader that codes which are perfectly reportable are not.
  const assignments = client.match(/stopped = \{/g) ?? [];
  assert.equal(assignments.length, 2, 'the page-wide stop belongs to 429 and 503 alone');
  assert.match(client, /response\.status === 503\) return \{ status: 'unavailable' \}/);
  assert.match(client, /response\.status < 500\) return \{ status: 'refused' \}/);
});

test('the failure copy is split: only one of the two invites another click', () => {
  const client = readFileSync('src/scripts/code-reports.ts', 'utf8');
  assert.match(client, /const FAILURE_LINE = 'Not recorded\. Try again later\.'/);
  assert.match(client, /const UNAVAILABLE_LINE = '[^']+'/);

  const unavailable = client.match(/const UNAVAILABLE_LINE = '([^']+)'/)[1];
  assert.doesNotMatch(unavailable, /again|later|retry/i, 'a 4xx or a 503 will not clear on a retry');

  // 429 re-enables the button; the settled answers leave it disabled.
  const handler = client.slice(client.indexOf("addEventListener('click'"));
  assert.match(handler, /disableThumbs\(group\);\s*\n\s*statusLine\(group, UNAVAILABLE_LINE\)/);
  assert.match(handler, /button\.disabled = false;\s*\n\s*statusLine\(group, FAILURE_LINE\)/);
});

test('the client paints the verdict the server holds, and says so when it differs', () => {
  const client = readFileSync('src/scripts/code-reports.ts', 'utf8');
  assert.match(client, /isVerdict\(body\.verdict\) \? body\.verdict : verdict/, 'the answer decides');
  assert.match(client, /markChosen\(group, outcome\.verdict\)/);
  assert.match(client, /rememberReported\(entryId, outcome\.verdict\)/);
  assert.match(client, /stored === clicked[\s\S]*Your earlier report today stands/);
});

test('success is announced, not just coloured, and the thumb says it is pressed', () => {
  // The live region used to be cleared on success, so a screen-reader user heard
  // nothing when a report was recorded and only ever heard the failures.
  const client = readFileSync('src/scripts/code-reports.ts', 'utf8');
  assert.match(client, /statusLine\(group, confirmation\(outcome\.verdict, verdict\)\)/);
  assert.match(client, /setAttribute\('aria-pressed', String\(option === verdict\)\)/);

  const screen = readFileSync('src/components/pages/RouteScreen.astro', 'utf8');
  assert.match(screen, /data-report-status aria-live="polite"/);
  assert.doesNotMatch(
    screen,
    /\.report-status:empty \{ display: none; \}/,
    'a live region that is display:none when the text arrives is not announced',
  );
});

test('the control and its note are both gated on configuration, and neither ships hidden', () => {
  const screen = readFileSync('src/components/pages/RouteScreen.astro', 'utf8');
  const gated = screen.match(/\{readerReportsEnabled &&/g) ?? [];
  assert.equal(gated.length, 2, 'the control and the note, each behind the flag once');
  assert.match(screen, /const readerReportsEnabled = operations\.services\.reports\.enabled;/);
  assert.doesNotMatch(screen, /data-code-report=\{item\.entry\.id\} hidden/, 'a rendered control is a visible one');
  assert.doesNotMatch(screen, /data-report-count/, 'no count is fetched, so none is painted');
});

test('the reader-report script stays in the unconditional script block', () => {
  // Astro hoists `<script>` at build time. Moving this import into a block behind
  // `readerReportsEnabled` drops its chunk from the output entirely: the control
  // renders and nothing is listening. Verified by building it that way once.
  const screen = readFileSync('src/components/pages/RouteScreen.astro', 'utf8');
  const open = screen.indexOf('<script>');
  const block = screen.slice(open, screen.indexOf('</script>', open));
  assert.match(block, /import '\.\.\/\.\.\/scripts\/search';/);
  assert.match(block, /import '\.\.\/\.\.\/scripts\/code-reports';/);
});

test('the operational flag the component reads is the one the endpoint reads', () => {
  // Two files, one switch. If they ever read different fields, the control renders
  // where the endpoint refuses, or the endpoint accepts where nothing is rendered.
  const endpoint = readFileSync('src/pages/api/code-report.json.ts', 'utf8');
  assert.match(endpoint, /readerReportsEnabled\(operations\)/);
  assert.match(endpoint, /reportableEntryIds\(operations\)/);
  assert.equal(readerReportsEnabled({ services: { reports: { enabled: true } } }), true);
  assert.equal(readerReportsEnabled({ services: { reports: { enabled: 'yes' } } }), false, 'boolean only');
  assert.equal(readerReportsEnabled({}), false, 'and absent means off');
});

// ---------------------------------------------------------------------------
// Aggregation: the editor's path, never the reader's
// ---------------------------------------------------------------------------

test('counts are derived by listing the prefix, following the cursor to the end', async () => {
  const store = new FakeReportStore({ pageSize: 2 });
  const day = '2026-08-26';
  for (const [index, verdict] of ['worked', 'failed', 'failed', 'failed', 'failed'].entries()) {
    await store.put(voteKey(day, ENTRY, printOf(index)), verdict, { expirationTtl: DEDUPE_TTL_SECONDS });
  }
  await store.put(voteKey(day, 'another-game-codes:codes:x', printOf(0)), 'worked');
  await store.put(voteKey('2026-08-25', ENTRY, printOf(0)), 'worked');

  const counts = await tallyVotes(store, day, ENTRY);
  assert.deepEqual(counts, { worked: 1, failed: 4 }, 'other entries and other days stay out');
  assert.ok(store.lists.length > 1, 'the cursor loop must run, or a busy code is under-counted');

  const wholeDay = await tallyVotes(store, day);
  assert.deepEqual(wholeDay, { worked: 2, failed: 4 });
});

test('one entry’s tally never swallows a longer id built from it', async () => {
  // Entry ids may contain ':', so `hb:<day>:a:b:` is also a prefix of every vote on
  // `a:b:c`. The prefix identity that makes listing work says nothing about
  // disjointness, and the header comment used to claim it did. A tally for one entry
  // therefore checks that what follows the prefix is a fingerprint and nothing else.
  const store = new FakeReportStore({ pageSize: 10 });
  const day = '2026-08-26';
  await store.put(voteKey(day, 'a:b', printOf(1)), 'worked');
  await store.put(voteKey(day, 'a:b', printOf(2)), 'failed');
  await store.put(voteKey(day, 'a:b:c', printOf(3)), 'failed');
  await store.put(voteKey(day, 'a:b:c', printOf(4)), 'failed');

  assert.ok(voteKey(day, 'a:b:c', printOf(3)).startsWith(votePrefix(day, 'a:b')), 'the prefixes do overlap');

  const parent = await tallyVotes(store, day, 'a:b');
  const child = await tallyVotes(store, day, 'a:b:c');
  assert.deepEqual(parent, { worked: 1, failed: 1 }, 'the child’s two failures are not the parent’s');
  assert.deepEqual(child, { worked: 0, failed: 2 });

  const wholeDay = await tallyVotes(store, day);
  assert.equal(parent.worked + parent.failed + child.worked + child.failed, wholeDay.worked + wholeDay.failed);
});

test('a key the prefix caught but the fingerprint did not is never even read', async () => {
  // The filter runs before the get, so a longer id's votes cost the tally no KV reads.
  const store = new FakeReportStore({ pageSize: 10 });
  const day = '2026-08-26';
  await store.put(voteKey(day, 'a:b', printOf(1)), 'worked');
  await store.put(voteKey(day, 'a:b:c', printOf(2)), 'failed');
  store.gets.length = 0;

  await tallyVotes(store, day, 'a:b');
  assert.deepEqual(store.gets, [voteKey(day, 'a:b', printOf(1))]);
});

test('a lopsided tally is what moves a code up the queue, and nothing else does', () => {
  assert.equal(needsRecheck({ worked: 0, failed: 4 }), false, 'four reports is still noise');
  assert.equal(needsRecheck({ worked: 1, failed: 4 }), true);
  assert.equal(needsRecheck({ worked: 3, failed: 2 }), false);
  assert.equal(needsRecheck({ worked: 2, failed: 3 }), true);
});
