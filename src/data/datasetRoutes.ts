import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/** The sections whose pages are rendered from a prose/dataset pair. */
export const datasetSections = ['guides', 'daily', 'blog'] as const;

export type DatasetSectionName = (typeof datasetSections)[number];

/**
 * Every path owned by a dataset-backed page.
 *
 * Read from disk rather than from the content collection because the only caller
 * that needs it, `astro.config.mjs`, runs before `astro:content` exists. The
 * writer contract fixes the mapping this relies on: one prose file per page at
 * `src/content/<section>/<slug>.md`, the slug equal to the filename, and the
 * permalink `/<section>/<slug>/`.
 *
 * ## Why this exists
 *
 * Two things decide whether a `/daily/<slug>/` or `/guides/<slug>/` URL is
 * indexable, and they can disagree. `routeDefinitions` describes the operational
 * page the route table would render, and marks it `noindex` while the game has no
 * live data. A dataset page is a different renderer with its own judgement, and it
 * takes the path over via `getStaticPaths`.
 *
 * When a dataset page claims a path, the route-table entry for that slug describes
 * a page that no longer renders. `/daily/monopoly-go/` shipped indexable and absent
 * from the sitemap for exactly that reason: the page said index, the stale route
 * entry said noindex, and the sitemap filter believed the entry. The page that
 * actually renders is the one whose judgement counts.
 *
 * A missing section directory is a normal state, not an error: sections are
 * populated one batch at a time.
 */
export const datasetBackedPaths = (root = process.cwd()): string[] => {
  const paths: string[] = [];

  for (const section of datasetSections) {
    let files: string[];
    try {
      files = readdirSync(join(root, 'src', 'content', section));
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      paths.push(`/${section}/${file.slice(0, -'.md'.length)}/`);
    }
  }

  return paths;
};
