import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { datasetCollection } from './lib/datasetCollection.ts';

const codes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/codes' }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
});

/*
 * Dataset-backed collections. Prose and data are separate files, paired by
 * slug, with every table and count rendered from the dataset at build.
 */
const guides = defineCollection({
  loader: datasetCollection({
    contentDir: 'src/content/guides',
    dataDir: 'src/data/guides',
    section: 'guides',
  }),
});

const daily = defineCollection({
  loader: datasetCollection({
    contentDir: 'src/content/daily',
    dataDir: 'src/data/daily',
    section: 'daily',
  }),
});

const blog = defineCollection({
  loader: datasetCollection({
    contentDir: 'src/content/blog',
    dataDir: 'src/data/blog',
    section: 'blog',
  }),
});

export const collections = { articles, codes, guides, daily, blog };
