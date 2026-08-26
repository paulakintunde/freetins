/*
 * Discovery for dataset-backed pages.
 *
 * The section hubs and the search index are both built from `editorialArticles`,
 * which the dataset collections are not part of. Without this, a dataset page
 * renders at its permalink but nothing on the site links to it, which is the
 * orphan case the writer contract forbids. Both surfaces read from here so they
 * cannot drift apart.
 */

import { datasetMetaDescription } from './metaDescription.ts';
import { earliestAddedAt } from './normalise.ts';
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
  /**
   * The subject's own identifier, as the dataset states it: a numeric listing id
   * for a game, or a URL for a platform-wide mechanism that belongs to no single
   * game. Interlinking matches on this rather than on a similar-looking slug, so
   * a link between two pages is a fact about the subject and not a guess.
   */
  entityId: string;
  /**
   * The earliest row's added_at, or empty when no row carries one. A page
   * written after the ledger types no checkedAt, so this is what the hub
   * sorts and labels it by ("Added <date>").
   */
  addedAt: string;
  /** Rows carrying the Active · as published baseline. Zero on a new page. */
  activeCount: number;
  /** Rows an editor has verified. Zero until an editor acts. */
  verifiedCount: number;
  listedCount: number;
  totalCount: number;
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
      /*
       * The page's own title, not the dataset subject. The subject names the
       * entity, so three Steal a Brainrot pages all reduced to "Steal a
       * Brainrot" and appeared as indistinguishable cards on the hub and as
       * three identical search results.
       */
      heading: data.title ?? dataset.subject ?? entry.id,
      // The same text the page puts in its meta description: the writer's
      // front-matter line, else the unverified summary cut to snippet length.
      description: datasetMetaDescription({
        description: data.description,
        unverifiedSummary: dataset.unverifiedSummary,
        title: data.title,
      }),
      section,
      focusKeyword: data.focusKeyword ?? '',
      secondaryKeywords: data.secondaryKeywords ?? [],
      checkedAt: dataset.checkedAt ?? '',
      entityId: String(dataset.entityId ?? ''),
      addedAt: earliestAddedAt(dataset.rows ?? []),
      activeCount: data.counts?.activeCount ?? 0,
      verifiedCount: data.counts?.verifiedCount ?? 0,
      listedCount: data.counts?.listedCount ?? 0,
      totalCount: data.counts?.totalCount ?? 0,
    };
  });
};

export const listAllDatasetPages = async (): Promise<DatasetPageSummary[]> => {
  const sections: DatasetSection[] = ['guides', 'daily', 'blog'];
  const results = await Promise.all(sections.map((section) => listDatasetPages(section)));
  return results.flat();
};
