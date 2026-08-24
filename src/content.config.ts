import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const codes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/codes' }),
});

export const collections = { codes };
