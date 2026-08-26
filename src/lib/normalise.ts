/*
 * Shared normalisation from the on-disk JSON shape to the internal Dataset type.
 *
 * Lives apart from the loader so the standalone content checker can reuse it
 * without pulling in Astro. One normaliser means the checker and the build
 * cannot disagree about what a dataset file means.
 *
 * Two shapes are accepted, on purpose. Pages that predate the Confirmation
 * Ledger carry typed verification fields — status, last_verified_at,
 * confidence, checked_at and the rest — and those are still read, because
 * every existing page keeps the status it displays (docs/adr/0004). Pages
 * written after it carry none of them and supply evidence, added_at and
 * requirements instead (docs/adr/0003). Nothing here rejects either shape;
 * what a field means for display is decided downstream.
 */

import type { Dataset, DatasetRow, DatasetTable } from './dataset.ts';

/** Lower-case, alphanumeric runs joined by hyphens: stable while the name is. */
export const slugifyName = (value: string): string =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * A row's ledger id when the writer did not set one. Derived from the page,
 * the table and the row name so the checker and the build agree on it without
 * either having to store it.
 */
export const derivedRowId = (slug: string, tableId: string, name: string): string =>
  `${slug}:${tableId}:${slugifyName(name)}`;

/**
 * Explicit rather than a deep key transform, because cell keys are column
 * labels and table keys are ids. Neither may be rewritten.
 */
export const normaliseDataset = (raw: any, slug: string): Dataset => {
  const pageSlug: string = raw.slug ?? slug;

  const tables: Record<string, DatasetTable> = Object.fromEntries(
    Object.entries(raw.tables ?? {}).map(([id, table]: [string, any]) => [
      id,
      {
        caption: table.caption ?? '',
        columns: table.columns ?? [],
        classificationColumn: table.classification_column ?? undefined,
        kind: table.kind ?? undefined,
      },
    ]),
  );
  const firstTableId = Object.keys(tables)[0] ?? '';

  const rows: DatasetRow[] = (raw.rows ?? []).map((row: any): DatasetRow => {
    const tableId: string = row.table ?? firstTableId;
    const name: string = row.name ?? '';
    return {
      id: row.id ?? derivedRowId(pageSlug, tableId, name),
      table: row.table ?? undefined,
      name,
      cells: row.cells ?? {},
      classification: row.classification ?? undefined,
      status: row.status ?? 'unverified',
      caseSensitive: row.case_sensitive ?? undefined,
      requirements: row.requirements ?? undefined,
      addedAt: row.added_at ?? null,
      lastVerifiedAt: row.last_verified_at ?? '',
      endedAt: row.ended_at ?? null,
      expiresAt: row.expires_at ?? null,
      url: row.url ?? undefined,
      evidence: (row.evidence ?? []).map((item: any) => ({ tier: item.tier, url: item.url })),
      confidence: row.confidence ?? 'reported',
      needsHuman: row.needs_human ?? false,
      notes: row.notes ?? '',
    };
  });

  return {
    subject: raw.subject ?? '',
    slug: pageSlug,
    entityId: String(raw.entity_id ?? ''),
    entityUrl: raw.entity_url ?? undefined,
    developer: raw.developer ?? '',
    permalink: raw.permalink ?? '',
    checkedAt: raw.checked_at ?? '',
    contentChangedAt: raw.content_changed_at ?? '',
    recheckCadence: raw.recheck_cadence ?? '',
    readerConfirmations: typeof raw.reader_confirmations === 'boolean' ? raw.reader_confirmations : undefined,
    officialSources: (raw.official_sources ?? []).map((item: any) => ({
      type: item.type ?? 'official_page',
      url: item.url ?? '',
      note: item.note ?? undefined,
    })),
    tables,
    rows,
    unverifiedSummary: raw.unverified_summary ?? '',
    disagreements: (raw.disagreements ?? []).map((item: any) => ({
      item: item.item ?? '',
      sourceA: item.source_a ?? '',
      sourceB: item.source_b ?? '',
      confirmed: item.confirmed ?? '',
    })),
    fakes: (raw.fakes ?? []).map((item: any) => ({
      claim: item.claim ?? '',
      whyWrong: item.why_wrong ?? '',
      origin: item.origin ?? '',
    })),
    changes: (raw.changes ?? []).map((item: any) => ({ at: item.at ?? '', what: item.what ?? '' })),
    nextChange: {
      pattern: raw.next_change?.pattern ?? '',
      watch: raw.next_change?.watch ?? [],
    },
  };
};
