/*
 * Dataset layer for the guides and daily collections.
 *
 * A page is two files: prose in src/content/<kind>/<slug>.md and its dataset in
 * src/data/<kind>/<slug>.json. Every table, count and timestamp on the rendered
 * page comes from the dataset, so the prose can never contradict the table.
 */

export type RowStatus = 'active' | 'unverified' | 'expired' | 'removed';
export type RowConfidence = 'confirmed' | 'reported' | 'conflicting';

export interface DatasetEvidence {
  /** 0 ground truth, 1 official, 2 reputable outlet, 3 confirmation only. */
  tier: 0 | 1 | 2 | 3;
  url: string;
}

/**
 * What a table's rows are, which decides how the ledger treats them: a `code`
 * is redeemed, a `link` is opened and expires on a TTL, a `fact` is observed.
 * Absent means `fact`.
 */
export type TableKind = 'fact' | 'link' | 'code';

export interface DatasetTable {
  caption: string;
  /** Subject columns. Status and Last checked are appended by the renderer. */
  columns: string[];
  /** Which column carries the classification used to build the sub-tables. */
  classificationColumn?: string;
  kind?: TableKind;
}

/*
 * Two generations of row live here. `status`, `lastVerifiedAt`, `confidence`,
 * `endedAt` and `needsHuman` are the typed verification fields of pages that
 * predate the ledger; they are read so those pages keep the status they show,
 * and never required of a new page (docs/adr/0003, docs/adr/0004). `id`,
 * `addedAt`, `evidence` and `requirements` are what every row carries.
 */
export interface DatasetRow {
  /** Ledger id. Derived from slug, table and name when the writer sets none. */
  id: string;
  /** Table id this row belongs to. Defaults to the first declared table. */
  table?: string;
  name: string;
  /** Column label to cell value. Keys must match the table's columns. */
  cells: Record<string, string>;
  classification?: string;
  status: RowStatus;
  caseSensitive?: boolean;
  requirements?: string;
  addedAt?: string | null;
  /** Empty on a row nobody has checked yet. */
  lastVerifiedAt: string;
  endedAt?: string | null;
  /** Link rows only: the publisher's own expiry, when known. */
  expiresAt?: string | null;
  /** Link rows only: the reward URL, when known. */
  url?: string;
  evidence: DatasetEvidence[];
  confidence: RowConfidence;
  needsHuman?: boolean;
  notes?: string;
}

export interface DatasetDisagreement {
  item: string;
  sourceA: string;
  sourceB: string;
  confirmed: string;
}

export interface DatasetFake {
  claim: string;
  whyWrong: string;
  origin: string;
}

export interface DatasetChange {
  at: string;
  what: string;
}

export interface Dataset {
  subject: string;
  slug: string;
  /** Place ID, app ID or official page URL. Powers the disambiguation line. */
  entityId: string;
  entityUrl?: string;
  developer: string;
  permalink: string;
  /** Typed on pre-ledger pages; empty on new ones, where the ledger supplies it. */
  checkedAt: string;
  contentChangedAt: string;
  recheckCadence: string;
  /** Per-page hearts switch; absent means the section default. */
  readerConfirmations?: boolean;
  officialSources: { type: string; url: string; note?: string }[];
  tables: Record<string, DatasetTable>;
  rows: DatasetRow[];
  unverifiedSummary: string;
  disagreements: DatasetDisagreement[];
  fakes: DatasetFake[];
  changes: DatasetChange[];
  nextChange: { pattern: string; watch: string[] };
}

/** Active rows go stale after this long without a recheck. */
export const STALE_AFTER_DAYS = 14;

/** Shorteners and placeholder hosts the brief bans outright. */
export const BANNED_SOURCE = /(example\.com|example\.invalid|freetins\.local|ceesty|clkmein|bit\.ly|tinyurl|cutt\.ly|shorte\.st|adf\.ly)/i;

const isIso = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

/**
 * Decides what status a row is actually allowed to display.
 *
 * A data file states an intent; this decides what the reader is shown. Two
 * demotions apply, and no data file can opt out of either:
 *
 * 1. Only a `confirmed` row may show as Active. A row sourced from two outlets
 *    with no publisher confirmation is `reported`, and reported is not the same
 *    as verified, so it renders Unverified until a human upgrades it.
 * 2. An active row whose last check has aged past the freshness window is
 *    downgraded, because nobody has confirmed it recently enough to assert it.
 *
 * Both run at build, so inflating a timestamp or optimistically marking a row
 * active cannot get an unverified claim onto the page.
 */
export const resolveDisplayStatus = (rows: DatasetRow[], now: number): DatasetRow[] =>
  rows.map((row) => {
    if (row.status !== 'active') return row;

    const demote = { ...row, status: 'unverified' as RowStatus };
    if (row.confidence !== 'confirmed') return demote;

    const checked = Date.parse(row.lastVerifiedAt);
    if (Number.isNaN(checked)) return demote;
    return now - checked > STALE_AFTER_DAYS * 86_400_000 ? demote : row;
  });

export interface DatasetCounts {
  totalCount: number;
  activeCount: number;
  unverifiedCount: number;
  expiredCount: number;
  removedCount: number;
  confirmedCount: number;
}

export const countRows = (rows: DatasetRow[]): DatasetCounts => ({
  totalCount: rows.length,
  activeCount: rows.filter((row) => row.status === 'active').length,
  unverifiedCount: rows.filter((row) => row.status === 'unverified').length,
  expiredCount: rows.filter((row) => row.status === 'expired').length,
  removedCount: rows.filter((row) => row.status === 'removed').length,
  confirmedCount: rows.filter((row) => row.confidence === 'confirmed').length,
});

const TABLE_KINDS = new Set(['fact', 'link', 'code']);
const ROW_ID = /^[a-z0-9][a-z0-9:_./-]*$/i;

/**
 * Validation runs at build, so a bad dataset fails the build rather than
 * shipping a page that asserts something nobody checked.
 *
 * What it checks is the shape of a claim, never the claim itself. A writer
 * supplies facts an author can know: that a row exists, where it was seen,
 * when it was added, what it requires. Whether a row has been checked is the
 * ledger's business, so the typed verification fields of pre-ledger pages are
 * validated for form when present and required of nobody (docs/adr/0003). No
 * rule here can reject a page for want of verification (docs/adr/0004).
 */
export const validateDataset = (dataset: Dataset): string[] => {
  const errors: string[] = [];
  const label = dataset.slug || 'unknown dataset';
  const now = Date.now();

  for (const field of ['subject', 'slug', 'entityId', 'developer', 'permalink'] as const) {
    if (!String(dataset[field] ?? '').trim()) errors.push(`${label}: ${field} is required`);
  }
  for (const field of ['checkedAt', 'contentChangedAt'] as const) {
    const value = dataset[field];
    if (!value) continue;
    if (!isIso(value)) errors.push(`${label}: ${field} must be an ISO 8601 timestamp when present`);
    else if (Date.parse(value) > now) errors.push(`${label}: ${field} is in the future`);
  }
  if (!dataset.officialSources?.length) errors.push(`${label}: at least one official source is required`);
  if (!Object.keys(dataset.tables ?? {}).length) errors.push(`${label}: at least one table must be declared`);

  for (const [id, table] of Object.entries(dataset.tables ?? {})) {
    if (table.kind !== undefined && !TABLE_KINDS.has(table.kind)) {
      errors.push(`${label}: table "${id}" has an unknown kind "${table.kind}"`);
    }
  }
  for (const change of dataset.changes ?? []) {
    if (!isIso(change.at)) errors.push(`${label}: change log entry "${change.what}" needs an ISO 8601 date`);
  }

  const tableIds = Object.keys(dataset.tables ?? {});
  const seen = new Set<string>();
  const seenIds = new Set<string>();

  dataset.rows?.forEach((row, index) => {
    const rowLabel = `${label} row ${index + 1} (${row.name || 'unnamed'})`;
    if (!row.name?.trim()) errors.push(`${rowLabel}: name is required`);

    const tableId = row.table ?? tableIds[0] ?? '';
    const key = `${tableId}::${row.name?.toLowerCase()}`;
    if (seen.has(key)) errors.push(`${rowLabel}: duplicate row in the same table`);
    seen.add(key);

    if (!ROW_ID.test(row.id ?? '')) errors.push(`${rowLabel}: id "${row.id}" must be letters, digits and : _ . / -`);
    else if (seenIds.has(row.id)) errors.push(`${rowLabel}: duplicate row id "${row.id}"`);
    seenIds.add(row.id);

    if (!tableIds.includes(tableId)) errors.push(`${rowLabel}: unknown table "${tableId}"`);
    else {
      const columns = dataset.tables[tableId]?.columns ?? [];
      for (const column of columns) {
        if (!(column in row.cells)) errors.push(`${rowLabel}: missing cell for column "${column}"`);
      }
      // The first column is the row's identity in the rendered table. If it
      // disagrees with name, the duplicate check above is checking nothing.
      const identity = columns[0];
      if (identity && row.cells[identity] !== undefined && row.cells[identity] !== row.name) {
        errors.push(`${rowLabel}: name does not match the "${identity}" cell`);
      }
    }

    // When a row was added is a fact the author knows, and the one date every
    // row must carry: seeds, sort order and the "New" chip all read it.
    if (!isIso(row.addedAt)) errors.push(`${rowLabel}: addedAt must be an ISO 8601 timestamp`);
    else if (Date.parse(row.addedAt) > now) errors.push(`${rowLabel}: addedAt is in the future`);

    if (row.lastVerifiedAt) {
      if (!isIso(row.lastVerifiedAt)) errors.push(`${rowLabel}: lastVerifiedAt must be ISO 8601 when present`);
      else if (Date.parse(row.lastVerifiedAt) > now) errors.push(`${rowLabel}: lastVerifiedAt is in the future`);
      else if (isIso(row.addedAt) && Date.parse(row.lastVerifiedAt) < Date.parse(row.addedAt)) {
        errors.push(`${rowLabel}: lastVerifiedAt predates addedAt`);
      }
    }
    if (row.expiresAt && !isIso(row.expiresAt)) errors.push(`${rowLabel}: expiresAt must be ISO 8601 when present`);
    if (row.url !== undefined && !/^https:\/\//.test(row.url)) errors.push(`${rowLabel}: url must be https when present`);

    if (!row.evidence?.length) errors.push(`${rowLabel}: at least one evidence URL is required`);
    row.evidence?.forEach((item) => {
      if (!/^https:\/\//.test(item.url)) errors.push(`${rowLabel}: evidence URL must be https`);
      if (BANNED_SOURCE.test(item.url)) errors.push(`${rowLabel}: banned source domain in evidence`);
    });
  });

  return errors;
};
