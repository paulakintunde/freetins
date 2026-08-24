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
 * "did not work" reports is evidence that an editor should re-check it now, which
 * turns a weak crowd signal into a strong editorial action without ever publishing
 * the crowd's opinion as fact.
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
 * An IP address is personal data. It is never stored. The dedup key is an HMAC of
 * the address with a server-side secret and a daily-rotating salt, which makes the
 * key one-way and unlinkable across days, and the key expires on its own. There is
 * no way to recover an address from stored data, and no way to follow one reader
 * from one code to another beyond the rotation window.
 */

export type CodeReportVerdict = 'worked' | 'failed';

export interface CodeReportCounts {
  worked: number;
  failed: number;
}

export interface CodeReportRecord extends CodeReportCounts {
  entryId: string;
  /** ISO timestamp of the most recent report. */
  updatedAt: string;
}

export interface CodeReportStore {
  get(key: string, type: 'json'): Promise<unknown>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/** A report is only counted once per address per code within this window. */
export const DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Below this, a failure ratio is noise rather than signal. */
const RECHECK_MIN_REPORTS = 5;
const RECHECK_FAILURE_RATIO = 0.6;

export const countsKey = (entryId: string) => `reports:${entryId}`;
export const dedupeKey = (fingerprint: string) => `seen:${fingerprint}`;

const emptyCounts: CodeReportCounts = { worked: 0, failed: 0 };

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

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
  const day = now.toISOString().slice(0, 10);
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
  return toHex(signature).slice(0, 32);
};

export const parseCounts = (value: unknown): CodeReportCounts => {
  if (!value || typeof value !== 'object') return { ...emptyCounts };
  const candidate = value as Partial<CodeReportCounts>;
  const worked = Number.isInteger(candidate.worked) && candidate.worked! >= 0 ? candidate.worked! : 0;
  const failed = Number.isInteger(candidate.failed) && candidate.failed! >= 0 ? candidate.failed! : 0;
  return { worked, failed };
};

export const isVerdict = (value: unknown): value is CodeReportVerdict =>
  value === 'worked' || value === 'failed';

/**
 * Whether the reports on an entry are lopsided enough to justify an editor
 * re-checking it now. This is the only decision the reports are allowed to drive.
 */
export const needsRecheck = (counts: CodeReportCounts) => {
  const total = counts.worked + counts.failed;
  if (total < RECHECK_MIN_REPORTS) return false;
  return counts.failed / total >= RECHECK_FAILURE_RATIO;
};

export const readCounts = async (store: CodeReportStore | undefined, entryId: string) => {
  if (!store) return { ...emptyCounts };
  try {
    return parseCounts(await store.get(countsKey(entryId), 'json'));
  } catch {
    return { ...emptyCounts };
  }
};
