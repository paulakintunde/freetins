/*
 * Discovery for dataset-backed pages.
 *
 * The section hubs and the search index are both built from `editorialArticles`,
 * which the dataset collections are not part of. Without this, a dataset page
 * renders at its permalink but nothing on the site links to it, which is the
 * orphan case the writer contract forbids. Both surfaces read from here so they
 * cannot drift apart.
 */

import { getCollection } from 'astro:content';

export type DatasetSection = 'guides' | 'daily' | 'blog';

export interface DatasetPageSummary {
  path: string;
  slug: string;
  heading: string;
  description: string;
  section: DatasetSection;
  focusKeyword: string;
  secondaryKeywords: string[];
  checkedAt: string;
}

/**
 * A collection with no entries throws rather than returning empty, so each
 * lookup is guarded. Sections are populated one batch at a time and an empty
 * one is a normal state, not an error.
 */
export const listDatasetPages = async (section: DatasetSection): Promise<DatasetPageSummary[]> => {
  let entries: Awaited<ReturnType<typeof getCollection>> = [];
  try {
    entries = await getCollection(section as 'guides');
  } catch {
    return [];
  }

  return entries.map((entry) => {
    const data = entry.data as Record<string, any>;
    const dataset = data.dataset ?? {};
    return {
      path: data.permalink ?? `/${section}/${entry.id}/`,
      slug: entry.id,
      heading: dataset.subject ?? data.title ?? entry.id,
      // The unverified summary is the most honest one-line description
      // available: it says what the page does and does not stand behind.
      description: dataset.unverifiedSummary ?? data.title ?? '',
      section,
      focusKeyword: data.focusKeyword ?? '',
      secondaryKeywords: data.secondaryKeywords ?? [],
      checkedAt: dataset.checkedAt ?? '',
    };
  });
};

export const listAllDatasetPages = async (): Promise<DatasetPageSummary[]> => {
  const sections: DatasetSection[] = ['guides', 'daily', 'blog'];
  const results = await Promise.all(sections.map((section) => listDatasetPages(section)));
  return results.flat();
};
