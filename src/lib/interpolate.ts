/*
 * Token interpolation for dataset-backed prose.
 *
 * Writers never type a count, a date or a table. They write a token and this
 * module resolves it against the dataset at build, which is what stops a page
 * asserting a number its own table contradicts.
 */

import {
  asPublished,
  countStates,
  displayState,
  type AsPublished,
  type Dataset,
  type DatasetRow,
  type DisplayState,
} from './dataset.ts';

/** The exact text of the Status cell for each state (docs/adr/0004). */
const STATE_LABELS: Record<DisplayState, string> = {
  verified: '★ Verified',
  active: 'Active · as published',
  listed: 'Listed · awaiting editor verification',
  expired: 'Expired',
};

/** What the Last checked cell reads before an editor has made one. */
const NOT_YET = 'not yet';

/** What a page-level date reads as before an editor has made one. */
const AWAITING = 'awaiting editor verification';

/**
 * The only recheck sentence a page renders. It promises nothing a schedule
 * would have to keep: rechecks appear on the page as editors make them. A
 * typed cadence was a promise nobody performed, so none is read
 * (docs/adr/0003).
 */
export const DERIVED_CADENCE = 'Rechecks are recorded on this page as editors make them. A row whose Last checked column reads not yet has not been tested by an editor.';

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

const rowsForTable = (dataset: Dataset, tableId: string): DatasetRow[] => {
  const firstTableId = Object.keys(dataset.tables)[0] ?? '';
  return dataset.rows.filter((row) => (row.table ?? firstTableId) === tableId);
};

/**
 * Whether one `status=` value selects a row.
 *
 * The public values are the four states. Two aliases keep pre-ledger prose
 * selecting exactly the rows it always did: `unverified` is `listed`, and
 * `removed` picks rows whose as-published baseline was removed. Because
 * `removed` stays selectable on its own, `expired` leaves those rows out, so a
 * page that shows `status=removed` and `status=expired` as two tables does not
 * list the same row twice. Both display as Expired regardless.
 */
const matchesStatus = (value: string, state: DisplayState, baseline: AsPublished): boolean => {
  switch (value) {
    case 'verified':
    case 'active':
      return state === value;
    case 'listed':
    case 'unverified':
      return state === 'listed';
    case 'expired':
      return state === 'expired' && baseline !== 'removed';
    case 'removed':
      return baseline === 'removed';
    default:
      return false;
  }
};

/**
 * Renders one dataset table. Status and Last checked are appended to every
 * table rather than left to the writer, because row-level provenance is the
 * whole differentiator and it must not be optional.
 */
const renderTable = (dataset: Dataset, now: number, argument: string): string => {
  const [rawTableId, ...filters] = argument.split('|').map((part) => part.trim());
  const tableId = rawTableId ?? '';
  const table = dataset.tables[tableId];
  if (!table) return `_Unknown table: ${tableId}_`;
  const tableColumns = table.columns;

  let selected = rowsForTable(dataset, tableId).map((row) => ({
    row,
    state: displayState(row, now, table.kind),
    baseline: asPublished(row),
  }));

  for (const filter of filters) {
    const [key, rawValue] = filter.split('=').map((part) => part.trim());
    if (!key || rawValue === undefined) continue;
    const values = rawValue.split(',').map((value) => value.trim().toLowerCase());
    if (key === 'status') {
      selected = selected.filter((item) => values.some((value) => matchesStatus(value, item.state, item.baseline)));
    } else if (key === 'not-status') {
      selected = selected.filter((item) => !values.some((value) => matchesStatus(value, item.state, item.baseline)));
    } else if (key === 'classification') {
      selected = selected.filter((item) => values.includes(String(item.row.classification ?? '').toLowerCase()));
    }
  }

  const columns = [...tableColumns, 'Status', 'Last checked'];
  const body = selected.map(({ row, state }) => [
    ...tableColumns.map((column) => row.cells[column] ?? ''),
    STATE_LABELS[state],
    // A row nobody has checked says so briefly; the Status cell already
    // carries the longer phrase, and repeating it per line reads as a fault.
    row.lastVerifiedAt ? formatDate(row.lastVerifiedAt) : NOT_YET,
  ]);
  return markdownTable(columns, body);
};

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
 *
 * `now` reaches only a link row's TTL. No count and no state depends on it.
 */
export const interpolate = (body: string, dataset: Dataset, now: number): InterpolationResult => {
  const counts = countStates(dataset.rows, now, dataset.tables);

  const scalars: Record<string, string> = {
    totalCount: String(counts.totalCount),
    verifiedCount: String(counts.verifiedCount),
    activeCount: String(counts.activeCount),
    listedCount: String(counts.listedCount),
    expiredCount: String(counts.expiredCount),
    // v1 aliases, kept so pre-ledger prose renders the numbers it always did.
    unverifiedCount: String(counts.unverifiedCount),
    removedCount: String(counts.removedCount),
    confirmedCount: String(counts.confirmedCount),
    // Pages that predate the ledger keep the dates they typed; a new page has
    // none until an editor acts, and says so instead of inventing one.
    checkedAt: dataset.checkedAt ? formatDate(dataset.checkedAt) : AWAITING,
    lastChanged: dataset.contentChangedAt ? formatDate(dataset.contentChangedAt) : AWAITING,
    subject: dataset.subject,
    developer: dataset.developer,
    entityId: dataset.entityId,
    recheckCadence: DERIVED_CADENCE,
    nextChangePattern: dataset.nextChange.pattern,
    unverifiedSummary: dataset.unverifiedSummary,
    freshness: DERIVED_CADENCE,
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

    if (token.startsWith('table:')) return renderTable(dataset, now, token.slice('table:'.length));

    const block = blocks[token];
    if (block) return block();

    const scalar = scalars[token];
    if (scalar !== undefined) return scalar;

    unresolved.push(token);
    return match;
  });

  return { body: rendered, unresolved };
};
