/*
 * Shared normalisation from the on-disk JSON shape to the internal Dataset type.
 *
 * Lives apart from the loader so the standalone content checker can reuse it
 * without pulling in Astro. One normaliser means the checker and the build
 * cannot disagree about what a dataset file means.
 */

import type { Dataset, DatasetRow } from './dataset.ts';

/**
 * Explicit rather than a deep key transform, because cell keys are column
 * labels and table keys are ids. Neither may be rewritten.
 */
export const normaliseDataset = (raw: any, slug: string): Dataset => ({
  subject: raw.subject ?? '',
  slug: raw.slug ?? slug,
  entityId: String(raw.entity_id ?? ''),
  entityUrl: raw.entity_url ?? undefined,
  developer: raw.developer ?? '',
  permalink: raw.permalink ?? '',
  checkedAt: raw.checked_at ?? '',
  contentChangedAt: raw.content_changed_at ?? '',
  recheckCadence: raw.recheck_cadence ?? '',
  officialSources: (raw.official_sources ?? []).map((item: any) => ({
    type: item.type ?? 'official_page',
    url: item.url ?? '',
    note: item.note ?? undefined,
  })),
  tables: Object.fromEntries(
    Object.entries(raw.tables ?? {}).map(([id, table]: [string, any]) => [
      id,
      {
        caption: table.caption ?? '',
        columns: table.columns ?? [],
        classificationColumn: table.classification_column ?? undefined,
      },
    ]),
  ),
  rows: (raw.rows ?? []).map((row: any): DatasetRow => ({
    table: row.table ?? undefined,
    name: row.name ?? '',
    cells: row.cells ?? {},
    classification: row.classification ?? undefined,
    status: row.status ?? 'unverified',
    caseSensitive: row.case_sensitive ?? undefined,
    requirements: row.requirements ?? undefined,
    addedAt: row.added_at ?? null,
    lastVerifiedAt: row.last_verified_at ?? '',
    endedAt: row.ended_at ?? null,
    evidence: (row.evidence ?? []).map((item: any) => ({ tier: item.tier, url: item.url })),
    confidence: row.confidence ?? 'reported',
    needsHuman: row.needs_human ?? false,
    notes: row.notes ?? '',
  })),
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
});
