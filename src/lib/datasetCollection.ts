/*
 * Custom Astro loader pairing prose with its dataset.
 *
 * src/content/<kind>/<slug>.md carries the prose and its tokens.
 * src/data/<kind>/<slug>.json carries the dataset those tokens resolve against.
 *
 * Pairing happens here rather than in the page component so a dataset error
 * fails the build, and so the rendered HTML contains real tables rather than
 * a component that has to be positioned separately from the prose.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';
import {
  applyStaleness,
  countRows,
  validateDataset,
  type Dataset,
  type DatasetRow,
} from './dataset.ts';
import { interpolate } from './interpolate.ts';
import { parseFrontmatter } from './frontmatter.ts';
import { runProseChecks } from './prose-qa.ts';

/**
 * Explicit rather than a deep key transform, because cell keys are column
 * labels and table keys are ids. Neither may be rewritten.
 */
const normaliseDataset = (raw: any, slug: string): Dataset => ({
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

export interface DatasetCollectionOptions {
  /** Directory holding the prose, relative to the project root. */
  contentDir: string;
  /** Directory holding the datasets, relative to the project root. */
  dataDir: string;
  /** Section this collection feeds, used for breadcrumbs and the byline. */
  section: 'guides' | 'daily' | 'blog';
}

export const datasetCollection = (options: DatasetCollectionOptions): Loader => ({
  name: `dataset-${options.section}`,

  async load({ store, logger, renderMarkdown, config }) {
    store.clear();

    // fileURLToPath, not pathname: a project directory containing a space
    // arrives percent-encoded and every subsequent readdir would miss.
    const root = fileURLToPath(config.root);
    const contentRoot = path.join(root, options.contentDir);
    const dataRoot = path.join(root, options.dataDir);

    let files: string[] = [];
    try {
      files = (await readdir(contentRoot)).filter((file) => file.endsWith('.md'));
    } catch {
      logger.info(`No ${options.section} prose directory yet, skipping.`);
      return;
    }

    const problems: string[] = [];
    const now = Date.now();

    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      const label = `${options.section}/${slug}`;

      // Normalised up front: a CRLF file would defeat every blank-line split
      // downstream, and writers on Windows produce them by default.
      const source = (await readFile(path.join(contentRoot, file), 'utf8'))
        .replace(/\r\n/g, '\n');
      const { frontmatter, body, errors } = parseFrontmatter(source, label);
      problems.push(...errors);

      let raw: unknown;
      try {
        raw = JSON.parse(await readFile(path.join(dataRoot, `${slug}.json`), 'utf8'));
      } catch (error) {
        problems.push(`${label}: dataset ${options.dataDir}/${slug}.json is missing or is not valid JSON`);
        continue;
      }

      const dataset = normaliseDataset(raw, slug);
      problems.push(...validateDataset(dataset));

      const { body: interpolated, unresolved } = interpolate(body, dataset, now);
      if (unresolved.length) {
        problems.push(`${label}: unresolved tokens: ${[...new Set(unresolved)].join(', ')}`);
      }

      problems.push(...runProseChecks(body, interpolated, label));

      if (!frontmatter) continue;

      const rows = applyStaleness(dataset.rows, now);
      const rendered = await renderMarkdown(interpolated);

      store.set({
        id: slug,
        filePath: path.posix.join(options.contentDir, file),
        data: {
          ...frontmatter,
          section: options.section,
          dataset,
          counts: countRows(rows),
        },
        body: interpolated,
        rendered,
      });
    }

    if (problems.length) {
      for (const problem of problems) logger.error(problem);
      throw new Error(
        `${problems.length} content problem(s) in the ${options.section} collection. See the errors above.`,
      );
    }

    logger.info(`Loaded ${files.length} ${options.section} page(s).`);
  },
});
