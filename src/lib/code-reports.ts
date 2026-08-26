/**
 * Reader reports on whether a code worked.
 *
 * This is deliberately a THIRD signal, separate from both the evidence state and
 * the evidence tier. It is never allowed to produce the `verified` label: verified
 * means an editor redeemed the code themselves, and letting a vote count grant that
 * label would recreate exactly the unverified-consensus problem the site exists to
 * avoid. Reader reports say what other players experienced. They do not say what
 * Freetins checked.
 *
 * What the reports are actually for is the re-check queue. A code collecting
 * "did not work" reports is evidence that an editor should look at it now, which
 * turns a weak crowd signal into a strong editorial action without ever publishing
 * the crowd's opinion as fact.
 *
 * ## The storage model: one key per vote, and no race
 *
 * A vote is one key, `hb:<day>:<entryId>:<fingerprint>`, whose value is the verdict.
 * Each key is written by exactly one reader, so there is no read-modify-write on the
 * request path and no lost update when two readers vote on the same code in the same
 * second. The model this replaced kept a counter object per code and incremented it:
 * concurrent votes lost counts, and a stale spread of the object could overwrite the
 * opposite verdict outright.
 *
 * Counts are therefore not stored state. They are derived by listing a prefix when an
 * editor works the queue (`tallyVotes`), never while answering a reader. Nothing a
 * reader sees depends on them, so deriving them late costs nothing and no reader is
 * ever shown a number that a race could have made wrong.
 *
 * ## What may become a key
 *
 * Two gates, in this order, and both are read from the operational data at build time,
 * so neither costs a request anything:
 *
 * 1. `services.reports.enabled`. False means the endpoint refuses on both verbs, with
 *    the same 503 as a missing binding. The control is not rendered either, so the flag
 *    is the one switch that turns the whole feature off — including its write budget —
 *    rather than only hiding the markup while the endpoint keeps accepting writes.
 * 2. Membership of `reportableEntryIds`. An entry id that is not on this site cannot
 *    become a key at all. Without it the charset alone bounds the namespace, and a
 *    thousand POSTs carrying invented ids would spend the account's whole daily write
 *    budget on records no editor will ever read.
 *
 * ## The budget this is built to fit
 *
 * Freetins runs on Cloudflare's free plan (docs/adr/0005). The binding limit is KV
 * writes: 1,000 a day, account-wide. One accepted vote is one write, so the ceiling is
 * 1,000 accepted votes a day. A repeat vote costs a read and no write. Reads and
 * Function invocations (100,000 a day each) are two orders of magnitude away, and a
 * page view spends none of either: whether the control renders at all is decided at
 * build time from `services.reports` in the operational data, not discovered at
 * runtime by probing this endpoint.
 *
 * When the write budget is spent, `recordVote` returns a refusal rather than throwing,
 * and the endpoint answers 429 `{ accepted: false, reason: 'paused' }`, which the
 * reader sees as one short line. That is the honest degradation, and it is only
 * acceptable because of what this signal does: a queue ordering may be capped and
 * occasionally lossy without a single published claim becoming less true. Nothing that
 * gates indexing or sets a label may be built this way. This is not one of those, and
 * never becomes one.
 *
 * ## On de-duplicating by IP
 *
 * De-duplicating by IP stops casual double-clicking. It is not fraud resistance and
 * should not be described as such:
 *
 * - Carrier-grade NAT and mobile networks put thousands of genuine users behind one
 *   address, so real reports get swallowed as duplicates.
 * - Dynamic addresses, VPNs and toggling mobile data let one person report many times.
 *
 * The counts are therefore presented as reports, never as a tally of distinct people.
 *
 * ## On privacy
 *
 * An IP address is personal data. It is never stored. The key's last segment is an
 * HMAC of the address with a server-side secret and the day, which makes it one-way
 * and unlinkable across days, and the key expires on its own. There is no way to
 * recover an address from stored data, and no way to follow one reader from one code
 * to another beyond the rotation window.
 *
 * One consequence, stated plainly: because both the fingerprint and the key carry the
 * day, a reader may vote on the same code again tomorrow. The record itself is kept
 * for `DEDUPE_TTL_SECONDS` so a week of votes can be tallied at once. Daily rotation
 * is the privacy property; a one-day dedup window is its price, and for a queue
 * ordering that price is worth paying.
 */

export type CodeReportVerdict = 'worked' | 'failed';

/** The subset of a KV list page this code reads. */
export interface CodeReportKeyPage {
  keys: Array<{ name: string }>;
  list_complete: boolean;
  cursor?: string;
}

export interface CodeReportListOptions {
  prefix: string;
  limit?: number;
  cursor?: string;
}

export interface CodeReportStore {
  get(key: string, type: 'json'): Promise<unknown>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  /**
   * Aggregation only. `list` is never called while answering a reader: it is the
   * editor-side path that derives counts from stored votes.
   */
  list(options: CodeReportListOptions): Promise<CodeReportKeyPage>;
}

/** A vote record is kept this long, which is also how far back a tally can reach. */
export const DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Longest entry id that may be written. Kept in step with ENTRY_ID_PATTERN's `{0,127}`. */
export const ENTRY_ID_MAX = 128;

/** How many hex characters of the HMAC a key carries. A tally depends on this exact width. */
export const FINGERPRINT_HEX_LENGTH = 32;

/**
 * The ledger's derived row ids are `<slug>:<table>:<name>`, so the charset has to
 * carry `:` and the separators a slug or a table name can contain.
 *
 * The charset is the cheap first pass, not the bound. What bounds the namespace is
 * membership of `reportableEntryIds`, derived at build time from the operational data:
 * an id that is not an entry on this site cannot become a key at all. That check was
 * scheduled for Step 1a and brought forward, because widening this pattern without it
 * left every 128-character string in the charset able to spend a KV write.
 */
const ENTRY_ID_PATTERN = /^[a-z0-9][a-z0-9:_./-]{0,127}$/;

/** What follows an entry's prefix in a vote key, and the only thing that may. */
const FINGERPRINT_PATTERN = new RegExp(`^[0-9a-f]{${FINGERPRINT_HEX_LENGTH}}$`);

const VOTE_NAMESPACE = 'hb';

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

/** The UTC day a vote belongs to. One function so the key and the HMAC cannot disagree. */
export const voteDay = (now: Date = new Date()) => now.toISOString().slice(0, 10);

/**
 * One-way fingerprint of address + code + day. The secret is required: without it
 * the space of IPv4 addresses is small enough to enumerate, so an unsalted hash
 * would be reversible and would not protect anyone.
 */
export const fingerprint = async (
  address: string,
  entryId: string,
  secret: string,
  now = new Date(),
) => {
  const day = voteDay(now);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${day}:${entryId}:${address}`),
  );
  return toHex(signature).slice(0, FINGERPRINT_HEX_LENGTH);
};

/** The one key a vote occupies. */
export const voteKey = (day: string, entryId: string, print: string) =>
  `${VOTE_NAMESPACE}:${day}:${entryId}:${print}`;

/**
 * The prefix a tally lists. Narrowing left to right: everything, one day, one entry
 * on one day. `voteKey(day, entryId, print)` is always `votePrefix(day, entryId) + print`,
 * which is what lets a tally list without parsing keys — entry ids contain `:` too,
 * so a key cannot be split back into fields and is never asked to be.
 *
 * That identity does NOT make one entry's prefix disjoint from another's. Because an
 * entry id may itself contain `:`, `votePrefix(day, 'a:b')` is also a prefix of every
 * vote cast on `a:b:c`. Listing one entry therefore has to check what follows the
 * prefix, and `tallyVotes` does. Listing a whole day needs no such check: everything
 * under `hb:<day>:` is a vote cast on that day.
 */
export const votePrefix = (day?: string, entryId?: string) => {
  if (!day) return `${VOTE_NAMESPACE}:`;
  if (!entryId) return `${VOTE_NAMESPACE}:${day}:`;
  return `${VOTE_NAMESPACE}:${day}:${entryId}:`;
};

export const isVerdict = (value: unknown): value is CodeReportVerdict =>
  value === 'worked' || value === 'failed';

/**
 * Whether a string may be used as an entry id. `..` is refused outright: no id on the
 * site contains it, and a key built from one reads as a traversal to every human who
 * later greps the namespace, which is a cost with no benefit.
 */
export const isEntryId = (value: unknown): value is string =>
  typeof value === 'string' && !value.includes('..') && ENTRY_ID_PATTERN.test(value);

// ---------------------------------------------------------------------------
// Configuration, read at build time
//
// Both functions below take the operational data (src/content/operations.json) and
// run once, when the endpoint module is evaluated. Neither runs per request: a click
// costs one KV read and at most one KV write, and never a walk of the inventory.
// ---------------------------------------------------------------------------

/** The shape these two read. Deliberately structural: the endpoint passes the whole file. */
export interface ReportableSource {
  services?: { reports?: { enabled?: unknown } };
  codes?: ReadonlyArray<{ id?: unknown }>;
  dailyLinks?: ReadonlyArray<{ id?: unknown }>;
  cheats?: ReadonlyArray<{ id?: unknown }>;
}

/**
 * Whether reader reports are configured to run at all. `true` is the operator's
 * statement that the namespace and the secret exist on the project; the endpoint still
 * refuses when either binding is missing, so this can only ever narrow what is accepted.
 */
export const readerReportsEnabled = (data: ReportableSource) =>
  data.services?.reports?.enabled === true;

/**
 * Every entry id a reader may report on: the code, daily-link and cheat entries of the
 * operational data, and nothing else.
 *
 * It is the whole published inventory rather than the live subset. The bound this
 * exists to impose is "an id that exists on this site", not "an id rendered right now":
 * resolving entry states per request would cost more than it saves, and admitting an
 * expired entry costs one record that a tally reads and an editor ignores.
 *
 * Dataset row ids (`<slug>:<table>:<name>`) are not in it. Dataset pages carry no report
 * control, so an id of that shape arriving at the endpoint is either a stale client or
 * an invented key, and both are refused.
 *
 * An id in the data that fails `isEntryId` never enters the set, so the charset check
 * and this one can never disagree about what a key may look like.
 */
export const reportableEntryIds = (data: ReportableSource): ReadonlySet<string> => {
  const ids = new Set<string>();
  for (const table of [data.codes, data.dailyLinks, data.cheats]) {
    for (const entry of table ?? []) {
      const id: unknown = entry?.id;
      if (isEntryId(id)) ids.add(id);
    }
  }
  return ids;
};

// ---------------------------------------------------------------------------
// Writing a vote
// ---------------------------------------------------------------------------

/**
 * A write the store refused rather than a write that was wrong. The endpoint answers
 * 429 either way — a reader cannot act on the difference — but the two must stay
 * distinguishable here so that a quota refusal is never read as a bug, or a bug as a
 * quota refusal. The endpoint logs the discrimination; see `CodeReportAnswer.refusal`.
 */
export class KvWriteRefused extends Error {
  readonly quota: boolean;

  constructor(message: string, options: { quota: boolean; cause?: unknown }) {
    super(message, { cause: options.cause });
    this.name = 'KvWriteRefused';
    this.quota = options.quota;
  }
}

/**
 * Whether a rejection reads as the free plan's daily write cap rather than a fault.
 * Cloudflare reports the cap as a 429 with a "limit exceeded" message; the match is
 * deliberately loose because the wording is not a contract and a missed match only
 * costs the accuracy of a log line.
 */
export const isQuotaRefusal = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /\b429\b|too many requests|limit exceeded|quota|rate limit/i.test(message);
};

export type VoteOutcome =
  | { status: 'recorded' }
  /** `stored` is the verdict already on record, or null when it could not be read. */
  | { status: 'already'; stored: CodeReportVerdict | null }
  | { status: 'refused'; refusal: KvWriteRefused };

/**
 * Record one vote. Never throws: every failure is a value the caller can answer with.
 *
 * A present key means this reader already voted on this code today. The stored verdict
 * is carried back rather than discarded, because it is the one that is actually on
 * record and it is not always the one just clicked — the answer must never paint a vote
 * the store does not hold.
 *
 * A read that fails is treated as absent, which risks one redundant write of an
 * identical key rather than losing the vote.
 */
export const recordVote = async (
  store: CodeReportStore,
  key: string,
  verdict: CodeReportVerdict,
): Promise<VoteOutcome> => {
  let existing: string | null = null;
  try {
    existing = await store.get(key);
  } catch {
    existing = null;
  }
  if (existing) return { status: 'already', stored: isVerdict(existing) ? existing : null };

  try {
    await store.put(key, verdict, { expirationTtl: DEDUPE_TTL_SECONDS });
  } catch (cause) {
    return {
      status: 'refused',
      refusal: new KvWriteRefused('The reader-report store refused a write.', {
        quota: isQuotaRefusal(cause),
        cause,
      }),
    };
  }
  return { status: 'recorded' };
};

// ---------------------------------------------------------------------------
// Answering a request
//
// The endpoint at src/pages/api/code-report.json.ts is the HTTP adapter: it reads
// the bindings off `env`, the configuration off the operational data, sets the headers
// and serialises. The decisions live here so they can be exercised against a fake
// store with no network and no Worker.
// ---------------------------------------------------------------------------

export interface CodeReportBindings {
  store: CodeReportStore | undefined;
  secret: string | undefined;
  /** `services.reports.enabled`, read from the operational data at build time. */
  enabled: boolean;
  /** The entry ids this build published. Anything else is refused before it is hashed. */
  reportable: ReadonlySet<string>;
}

export interface CodeReportAnswer {
  status: number;
  body: Record<string, unknown>;
  /**
   * Present on the 429 path only, and never serialised. It exists so the endpoint can
   * log whether the store refused for quota or for a fault: the reader gets the same
   * answer either way, and without the log the two are indistinguishable in production.
   */
  refusal?: KvWriteRefused;
}

export interface CodeReportSubmission {
  entry: unknown;
  verdict: unknown;
  /** Cloudflare's `CF-Connecting-IP`, or null when the header is absent. */
  address: string | null;
}

/**
 * Both bindings, both verbs, and the flag. A namespace without a secret used to let GET
 * answer `available: true` while every POST failed, which reveals a control that cannot
 * work — the exact failure the client is written to avoid. The flag is here for the
 * opposite reason: without it the endpoint accepted writes the moment the bindings
 * existed, with no control rendered anywhere and nothing on the site to explain them.
 */
const configured = (
  bindings: CodeReportBindings,
): bindings is CodeReportBindings & { store: CodeReportStore; secret: string } =>
  bindings.enabled && Boolean(bindings.store) && Boolean(bindings.secret);

const unavailable = (): CodeReportAnswer => ({
  status: 503,
  body: { available: false, reason: 'Reader reports are not configured.' },
});

const invalid = (error: string): CodeReportAnswer => ({ status: 400, body: { error } });

/**
 * What GET answers. Configuration only: no counts, no KV read, no per-entry work.
 * It exists so a client can confirm the endpoint is live, and it is deliberately not
 * called on page load — the control's visibility is a build-time decision.
 */
export const answerAvailability = (bindings: CodeReportBindings): CodeReportAnswer =>
  configured(bindings) ? { status: 200, body: { available: true } } : unavailable();

/** What POST answers. Never throws. */
export const answerReport = async (
  bindings: CodeReportBindings,
  submission: CodeReportSubmission,
  now: Date = new Date(),
): Promise<CodeReportAnswer> => {
  if (!configured(bindings)) return unavailable();

  // Validate first, then slice. Slicing first would turn one reader's overlong id into
  // a valid id for some other entry and record a vote against it; the slice that remains
  // is belt-and-braces, since the pattern already caps the length.
  const entryId = isEntryId(submission.entry) ? submission.entry.slice(0, ENTRY_ID_MAX) : '';
  if (!entryId) return invalid('Invalid entry id.');
  // An id that is not an entry of this build is refused with the same answer as a
  // malformed one. The difference is not something a reader can act on, and one answer
  // for both means the endpoint cannot be asked which ids exist.
  if (!bindings.reportable.has(entryId)) return invalid('Invalid entry id.');
  if (!isVerdict(submission.verdict)) return invalid('Verdict must be worked or failed.');

  // Cloudflare sets this; a request without it cannot be de-duplicated, so it is
  // refused rather than counted and left open to unlimited repeat submissions.
  if (!submission.address) return invalid('Report could not be attributed.');

  const day = voteDay(now);
  const print = await fingerprint(submission.address, entryId, bindings.secret, now);
  const outcome = await recordVote(bindings.store, voteKey(day, entryId, print), submission.verdict);

  if (outcome.status === 'refused') {
    return { status: 429, body: { accepted: false, reason: 'paused' }, refusal: outcome.refusal };
  }

  // The verdict on record, which on the repeat path is the earlier one rather than the
  // one just clicked. The client paints what comes back, so a reader is never shown a
  // vote the store does not hold. A stored value too damaged to read falls back to the
  // submitted verdict: that is the value the write would have carried.
  const verdict =
    outcome.status === 'already' ? outcome.stored ?? submission.verdict : submission.verdict;
  return { status: 200, body: { accepted: true, counted: outcome.status === 'recorded', verdict } };
};

// ---------------------------------------------------------------------------
// Aggregation
//
// Everything below runs when an editor works the queue. None of it is reachable
// from a reader's request, which is why it may cost a list and a read per vote.
// At the free plan's 1,000 accepted votes a day that is 1,000 reads against a
// 100,000 a day budget, spent once, by one person, on purpose.
// ---------------------------------------------------------------------------

export interface CodeReportCounts {
  worked: number;
  failed: number;
}

/** Below this, a failure ratio is noise rather than signal. */
export const RECHECK_MIN_REPORTS = 5;
export const RECHECK_FAILURE_RATIO = 0.6;

/**
 * Whether the reports on an entry are lopsided enough to justify an editor looking
 * at it now. This is the only decision the reports are allowed to drive, and the
 * queue computes it from a tally — the endpoint never does, because the endpoint
 * never holds a count.
 */
export const needsRecheck = (counts: CodeReportCounts) => {
  const total = counts.worked + counts.failed;
  if (total < RECHECK_MIN_REPORTS) return false;
  return counts.failed / total >= RECHECK_FAILURE_RATIO;
};

/** Derive counts for one entry on one day by listing its prefix and reading each vote. */
export const tallyVotes = async (
  store: CodeReportStore,
  day: string,
  entryId?: string,
): Promise<CodeReportCounts> => {
  const counts: CodeReportCounts = { worked: 0, failed: 0 };
  const prefix = votePrefix(day, entryId);
  // One entry's prefix is also a prefix of every longer id built from it — `a:b` and
  // `a:b:c` — so what follows it has to be a fingerprint and nothing else. A whole-day
  // prefix needs no such filter: every key beneath it is a vote cast on that day.
  const oneEntry = Boolean(entryId);
  let cursor: string | undefined;

  do {
    const page: CodeReportKeyPage = await store.list(cursor ? { prefix, cursor } : { prefix });
    for (const key of page.keys) {
      if (oneEntry && !FINGERPRINT_PATTERN.test(key.name.slice(prefix.length))) continue;
      const verdict = await store.get(key.name);
      if (isVerdict(verdict)) counts[verdict] += 1;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return counts;
};
