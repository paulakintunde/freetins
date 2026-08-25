import type { APIRoute } from 'astro';
import { searchIndex } from '../data/search';
import { listAllDatasetPages } from '../lib/datasetPages';
import type { SearchGroup, SearchRecord } from '../lib/search';

export const prerender = true;

const groupFor: Record<string, SearchGroup> = {
  guides: 'Guides',
  daily: 'Daily links',
  blog: 'Blog',
};

/**
 * Dataset-backed pages are appended here rather than in src/data/search.ts,
 * because reading a content collection needs async and that module is imported
 * synchronously. Leaving them out would make them unreachable from site search.
 */
const datasetRecords = async (): Promise<SearchRecord[]> =>
  (await listAllDatasetPages()).map((page) => ({
    path: page.path,
    title: page.heading,
    group: groupFor[page.section] ?? 'Guides',
    description: page.description,
    keywords: [page.focusKeyword, ...page.secondaryKeywords].filter(Boolean),
  }));

/** Emitted as a static asset at build time and fetched once by the search page. */
export const GET: APIRoute = async () =>
  Response.json(
    { version: 1, records: [...searchIndex, ...(await datasetRecords())] },
    { headers: { 'X-Robots-Tag': 'noindex' } },
  );
