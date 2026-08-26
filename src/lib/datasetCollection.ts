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
import { countStates, validateDataset } from './dataset.ts';
import { interpolate } from './interpolate.ts';
import { parseFrontmatter } from './frontmatter.ts';
import { runProseChecks } from './prose-qa.ts';
import { normaliseDataset } from './normalise.ts';

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
    // Reaches only a link row's TTL; no state or count on this surface reads it.
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

      problems.push(...runProseChecks(body, interpolated, label, {
        requireUnverifiedSection: dataset.disagreements.length > 0 || dataset.unverifiedSummary.trim().length > 0,
      }));

      if (!frontmatter) continue;

      const rendered = await renderMarkdown(interpolated);

      store.set({
        id: slug,
        filePath: path.posix.join(options.contentDir, file),
        data: {
          ...frontmatter,
          section: options.section,
          dataset,
          counts: countStates(dataset.rows, now, dataset.tables),
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
