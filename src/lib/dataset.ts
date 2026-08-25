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

export interface DatasetTable {
  caption: string;
  /** Subject columns. Status and Last checked are appended by the renderer. */
  columns: string[];
  /** Which column carries the classification used to build the sub-tables. */
  classificationColumn?: string;
}

export interface DatasetRow {
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
  lastVerifiedAt: string;
  endedAt?: string | null;
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
  checkedAt: string;
  contentChangedAt: string;
  recheckCadence: string;
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

/**
 * Validation runs at build, so a bad dataset fails the build rather than
 * shipping a page that asserts something nobody checked.
 */
export const validateDataset = (dataset: Dataset): string[] => {
  const errors: string[] = [];
  const label = dataset.slug || 'unknown dataset';
  const now = Date.now();

  for (const field of ['subject', 'slug', 'entityId', 'developer', 'permalink', 'recheckCadence'] as const) {
    if (!String(dataset[field] ?? '').trim()) errors.push(`${label}: ${field} is required`);
  }
  for (const field of ['checkedAt', 'contentChangedAt'] as const) {
    if (!isIso(dataset[field])) errors.push(`${label}: ${field} must be an ISO 8601 timestamp`);
    else if (Date.parse(dataset[field]) > now) errors.push(`${label}: ${field} is in the future`);
  }
  if (!dataset.officialSources?.length) errors.push(`${label}: at least one official source is required`);
  if (!String(dataset.unverifiedSummary ?? '').trim()) errors.push(`${label}: unverifiedSummary is required`);
  if (!dataset.changes?.length) errors.push(`${label}: changes needs at least one entry for the change log`);
  if (!Object.keys(dataset.tables ?? {}).length) errors.push(`${label}: at least one table must be declared`);

  const tableIds = Object.keys(dataset.tables ?? {});
  const seen = new Set<string>();

  dataset.rows?.forEach((row, index) => {
    const rowLabel = `${label} row ${index + 1} (${row.name || 'unnamed'})`;
    if (!row.name?.trim()) errors.push(`${rowLabel}: name is required`);

    const tableId = row.table ?? tableIds[0] ?? '';
    const key = `${tableId}::${row.name?.toLowerCase()}`;
    if (seen.has(key)) errors.push(`${rowLabel}: duplicate row in the same table`);
    seen.add(key);

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

    if (!isIso(row.lastVerifiedAt)) errors.push(`${rowLabel}: lastVerifiedAt must be ISO 8601`);
    else if (Date.parse(row.lastVerifiedAt) > now) errors.push(`${rowLabel}: lastVerifiedAt is in the future`);
    if (row.addedAt && isIso(row.addedAt) && isIso(row.lastVerifiedAt)
      && Date.parse(row.lastVerifiedAt) < Date.parse(row.addedAt)) {
      errors.push(`${rowLabel}: lastVerifiedAt predates addedAt`);
    }

    if (!row.evidence?.length) errors.push(`${rowLabel}: at least one evidence URL is required`);
    if (row.confidence === 'confirmed') {
      if ((row.evidence?.length ?? 0) < 2) errors.push(`${rowLabel}: confirmed rows need two evidence URLs`);
      if (!row.evidence?.some((item) => item.tier <= 1)) {
        errors.push(`${rowLabel}: confirmed rows need a tier 0 or tier 1 source`);
      }
    }
    row.evidence?.forEach((item) => {
      if (!/^https:\/\//.test(item.url)) errors.push(`${rowLabel}: evidence URL must be https`);
      if (BANNED_SOURCE.test(item.url)) errors.push(`${rowLabel}: banned source domain in evidence`);
    });
  });

  const archived = dataset.rows?.some((row) => row.status === 'expired' || row.status === 'removed');
  if (!archived && !/no (expired|removed|superseded)/i.test(dataset.unverifiedSummary ?? '')) {
    errors.push(`${label}: no archived rows and unverifiedSummary does not explain why none exist`);
  }

  return errors;
};
