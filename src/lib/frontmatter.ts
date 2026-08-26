/*
 * Front matter parser for the guides and daily collections.
 *
 * The schema is fixed by the writer contract, so this handles exactly the
 * shapes that contract allows: scalars, string lists, and the faq list of
 * question and answer pairs. Anything else is a writer error and is reported
 * rather than guessed at. Written in-repo because js-yaml is only a transitive
 * Astro dependency and is not resolvable from application code under pnpm.
 */
import { META_DESCRIPTION_LIMIT } from './metaDescription.ts';

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  permalink: string;
  category: string;
  categorySlug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  author: string;
  /** The meta description, hub-card and search text: answer first, 155 characters or fewer. */
  description?: string;
  featuredImage?: string;
  faq: { q: string; a: string }[];
}

const SCALAR_KEYS = new Set([
  'title', 'slug', 'permalink', 'category', 'category_slug',
  'focus_keyword', 'author', 'description', 'featured_image',
]);

const unquote = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && /^(".*"|'.*')$/s.test(trimmed)) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return trimmed;
};

export interface FrontmatterSplit {
  raw: Record<string, unknown>;
  body: string;
}

/** Splits the --- delimited block from the markdown body. */
export const splitFrontmatter = (source: string): FrontmatterSplit => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return { raw: {}, body: source };

  const block = match[1] ?? '';
  const body = match[2] ?? '';
  const raw: Record<string, unknown> = {};
  const lines = block.split(/\r?\n/);

  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (!line.trim() || line.trim().startsWith('#')) {
      index += 1;
      continue;
    }

    const entry = /^([a-z_]+):\s*(.*)$/.exec(line);
    const key = entry?.[1];
    if (!entry || !key) {
      index += 1;
      continue;
    }

    const inline = entry[2] ?? '';

    if (inline.trim()) {
      raw[key] = unquote(inline);
      index += 1;
      continue;
    }

    // A bare "key:" opens either a string list or a list of objects.
    const items: unknown[] = [];
    index += 1;
    let current: Record<string, string> | null = null;

    while (index < lines.length && /^\s+/.test(lines[index] ?? '')) {
      const child = lines[index] ?? '';
      const listItem = /^\s*-\s*(.*)$/.exec(child);

      if (listItem) {
        const value = listItem[1] ?? '';
        const pair = /^([a-z_]+):\s*(.*)$/.exec(value);
        const pairKey = pair?.[1];
        if (pair && pairKey) {
          current = { [pairKey]: unquote(pair[2] ?? '') };
          items.push(current);
        } else {
          current = null;
          items.push(unquote(value));
        }
      } else if (current) {
        const pair = /^\s*([a-z_]+):\s*(.*)$/.exec(child);
        const pairKey = pair?.[1];
        if (pair && pairKey) current[pairKey] = unquote(pair[2] ?? '');
      }
      index += 1;
    }

    raw[key] = items;
  }

  return { raw, body };
};

export interface FrontmatterResult {
  frontmatter: ArticleFrontmatter | null;
  body: string;
  errors: string[];
}

export const parseFrontmatter = (source: string, label: string): FrontmatterResult => {
  const { raw, body } = splitFrontmatter(source);
  const errors: string[] = [];

  const scalar = (key: string, required = true): string => {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (required) errors.push(`${label}: front matter "${key}" is required`);
    return '';
  };

  for (const key of Object.keys(raw)) {
    if (!SCALAR_KEYS.has(key) && key !== 'secondary_keywords' && key !== 'faq') {
      errors.push(`${label}: unexpected front matter key "${key}"`);
    }
  }

  const title = scalar('title');
  if (title.length > 65) errors.push(`${label}: title is ${title.length} characters, the limit is 65`);

  const secondary = Array.isArray(raw.secondary_keywords)
    ? raw.secondary_keywords.filter((item): item is string => typeof item === 'string')
    : [];
  if (secondary.length < 4 || secondary.length > 6) {
    errors.push(`${label}: secondary_keywords needs 4 to 6 entries, found ${secondary.length}`);
  }

  const faqSource = Array.isArray(raw.faq) ? raw.faq : [];
  const faq = faqSource
    .filter((item): item is Record<string, string> => typeof item === 'object' && item !== null)
    .map((item) => ({ q: String(item.q ?? '').trim(), a: String(item.a ?? '').trim() }));

  if (faq.length < 6 || faq.length > 10) {
    errors.push(`${label}: faq needs 6 to 10 pairs, found ${faq.length}`);
  }
  faq.forEach((pair, position) => {
    if (!pair.q || !pair.a) {
      errors.push(`${label}: faq pair ${position + 1} is missing a question or an answer`);
      return;
    }
    const words = pair.a.split(/\s+/).length;
    if (words < 40 || words > 90) {
      errors.push(`${label}: faq answer ${position + 1} is ${words} words, the range is 40 to 90`);
    }
  });

  const permalink = scalar('permalink');
  if (permalink && !/^\/.*\/$/.test(permalink)) {
    errors.push(`${label}: permalink must start and end with a slash`);
  }

  const featuredImage = scalar('featured_image', false);

  // The meta description. Anything past the cap is cut by the renderer, so the
  // writer is told here rather than finding the tail missing on the live page.
  const description = scalar('description', false);
  if (description.length > META_DESCRIPTION_LIMIT) {
    errors.push(`${label}: description is ${description.length} characters, the limit is ${META_DESCRIPTION_LIMIT}`);
  }

  const frontmatter: ArticleFrontmatter = {
    title,
    slug: scalar('slug'),
    permalink,
    category: scalar('category'),
    categorySlug: scalar('category_slug'),
    focusKeyword: scalar('focus_keyword'),
    secondaryKeywords: secondary,
    author: scalar('author'),
    ...(description ? { description } : {}),
    ...(featuredImage ? { featuredImage } : {}),
    faq,
  };

  return { frontmatter: errors.length ? null : frontmatter, body, errors };
};
