/*
 * Token interpolation for dataset-backed prose.
 *
 * Writers never type a count, a date or a table. They write a token and this
 * module resolves it against the dataset at build, which is what stops a page
 * asserting a number its own table contradicts.
 */

import {
  resolveDisplayStatus,
  countRows,
  type Dataset,
  type DatasetRow,
  type RowStatus,
} from './dataset.ts';

const STATUS_LABELS: Record<RowStatus, string> = {
  active: 'Active',
  unverified: 'Unverified',
  expired: 'Expired',
  removed: 'Removed',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatDate = (iso: string): string => {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? 'not recorded' : dateFormatter.format(parsed);
};

/** Pipes and newlines would break out of the generated table cell. */
const escapeCell = (value: string): string =>
  String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();

const markdownTable = (columns: string[], rows: string[][]): string => {
  if (rows.length === 0) return '_No rows recorded._';
  const header = `| ${columns.map(escapeCell).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`);
  return [header, divider, ...body].join('\n');
};

const rowsForTable = (dataset: Dataset, rows: DatasetRow[], tableId: string): DatasetRow[] => {
  const firstTableId = Object.keys(dataset.tables)[0] ?? '';
  return rows.filter((row) => (row.table ?? firstTableId) === tableId);
};

/**
 * Renders one dataset table. Status and Last checked are appended to every
 * table rather than left to the writer, because row-level provenance is the
 * whole differentiator and it must not be optional.
 */
const renderTable = (dataset: Dataset, rows: DatasetRow[], argument: string): string => {
  const [rawTableId, ...filters] = argument.split('|').map((part) => part.trim());
  const tableId = rawTableId ?? '';
  const table = dataset.tables[tableId];
  if (!table) return `_Unknown table: ${tableId}_`;
  const tableColumns = table.columns;

  let selected = rowsForTable(dataset, rows, tableId);

  for (const filter of filters) {
    const [key, rawValue] = filter.split('=').map((part) => part.trim());
    if (!key || rawValue === undefined) continue;
    const values = rawValue.split(',').map((value) => value.trim().toLowerCase());
    if (key === 'status') {
      selected = selected.filter((row) => values.includes(row.status));
    } else if (key === 'not-status') {
      selected = selected.filter((row) => !values.includes(row.status));
    } else if (key === 'classification') {
      selected = selected.filter((row) => values.includes(String(row.classification ?? '').toLowerCase()));
    }
  }

  const columns = [...tableColumns, 'Status', 'Last checked'];
  const body = selected.map((row) => [
    ...tableColumns.map((column) => row.cells[column] ?? ''),
    STATUS_LABELS[row.status],
    // A row nobody has checked says so, rather than showing a date it lacks.
    row.lastVerifiedAt ? formatDate(row.lastVerifiedAt) : AWAITING,
  ]);
  return markdownTable(columns, body);
};

/** What a date reads as before an editor has made one. */
const AWAITING = 'awaiting editor verification';

/**
 * The freshness sentence when the page does not type one. It promises nothing
 * a schedule would have to keep: rechecks appear on the page as they happen.
 */
const DERIVED_CADENCE = 'Rechecks are recorded on this page as editors make them. A row whose Last checked column reads awaiting editor verification has not been tested by an editor yet.';

const renderDisagreements = (dataset: Dataset): string =>
  dataset.disagreements.length === 0
    ? '_No source conflicts were found for this page._'
    : markdownTable(
        ['Item', 'What one source says', 'What the other says', 'What we could confirm'],
        dataset.disagreements.map((item) => [item.item, item.sourceA, item.sourceB, item.confirmed]),
      );

const renderFakes = (dataset: Dataset): string =>
  dataset.fakes.length === 0
    ? '_No fabricated versions of this were circulating at the last check._'
    : markdownTable(
        ['What is circulating', 'Why it is wrong', 'Where it came from'],
        dataset.fakes.map((item) => [item.claim, item.whyWrong, item.origin]),
      );

/** Newest first, capped at five, per the Change Log block spec. */
const renderChangelog = (dataset: Dataset): string => {
  if (dataset.changes.length === 0) return '_No changes recorded yet._';
  const recent = [...dataset.changes]
    .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
    .slice(0, 5);
  return markdownTable(['Date', 'What changed'], recent.map((item) => [formatDate(item.at), item.what]));
};

const renderOfficialSources = (dataset: Dataset): string =>
  dataset.officialSources
    .map((source) => `- [${source.note ?? source.type}](${source.url})`)
    .join('\n');

export interface InterpolationResult {
  body: string;
  unresolved: string[];
}

/**
 * Replaces every token in the prose body. Anything left unresolved is returned
 * rather than silently rendered as literal braces on the live page.
 */
export const interpolate = (body: string, dataset: Dataset, now: number): InterpolationResult => {
  const rows = resolveDisplayStatus(dataset.rows, now);
  const counts = countRows(rows);

  const scalars: Record<string, string> = {
    totalCount: String(counts.totalCount),
    activeCount: String(counts.activeCount),
    unverifiedCount: String(counts.unverifiedCount),
    expiredCount: String(counts.expiredCount),
    removedCount: String(counts.removedCount),
    confirmedCount: String(counts.confirmedCount),
    // Pages that predate the ledger keep the dates they typed; a new page has
    // none until an editor acts, and says so instead of inventing one.
    checkedAt: dataset.checkedAt ? formatDate(dataset.checkedAt) : AWAITING,
    lastChanged: dataset.contentChangedAt ? formatDate(dataset.contentChangedAt) : AWAITING,
    subject: dataset.subject,
    developer: dataset.developer,
    entityId: dataset.entityId,
    recheckCadence: dataset.recheckCadence || DERIVED_CADENCE,
    nextChangePattern: dataset.nextChange.pattern,
    unverifiedSummary: dataset.unverifiedSummary,
    freshness: dataset.recheckCadence || DERIVED_CADENCE,
  };

  const blocks: Record<string, () => string> = {
    disagreements: () => renderDisagreements(dataset),
    fakes: () => renderFakes(dataset),
    changelog: () => renderChangelog(dataset),
    officialSources: () => renderOfficialSources(dataset),
  };

  const unresolved: string[] = [];

  const rendered = body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match: string, rawToken: string) => {
    const token = rawToken.trim();

    if (token.startsWith('table:')) return renderTable(dataset, rows, token.slice('table:'.length));

    const block = blocks[token];
    if (block) return block();

    const scalar = scalars[token];
    if (scalar !== undefined) return scalar;

    unresolved.push(token);
    return match;
  });

  return { body: rendered, unresolved };
};
