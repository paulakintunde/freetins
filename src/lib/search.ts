/**
 * Pure, dependency-free search ranking used by both the build-time index
 * generator (`src/data/search.ts`) and the browser (`src/scripts/search.ts`).
 * Keeping it free of Astro imports lets `test/search.test.mjs` exercise it directly.
 */

export type SearchGroup =
  | 'Codes'
  | 'Item values'
  | 'Daily links'
  | 'Cheats'
  | 'Answers'
  | 'Guides'
  | 'Resources'
  | 'Site';

export interface SearchRecord {
  path: string;
  title: string;
  group: SearchGroup;
  description: string;
  keywords: string[];
}

export interface PreparedRecord {
  record: SearchRecord;
  title: string;
  titleTerms: string[];
  keywordTerms: string[];
  descriptionTerms: string[];
  pathTerms: string[];
}

export interface SearchResult {
  record: SearchRecord;
  score: number;
}

export interface SearchOptions {
  limit?: number;
}

const MAX_QUERY_LENGTH = 120;
const MIN_PREFIX_LENGTH = 2;

const FIELD_WEIGHTS = {
  titleExact: 12,
  titlePrefix: 7,
  keywordExact: 6,
  keywordPrefix: 3,
  descriptionExact: 3,
  descriptionPrefix: 1,
  pathExact: 2,
} as const;

const PHRASE_BONUS = {
  titleEquals: 60,
  titleStartsWith: 24,
  titleContains: 12,
} as const;

/**
 * Lowercases, folds diacritics, drops apostrophes so `Sol's RNG` and `sols rng`
 * agree, and reduces every other non-alphanumeric run to a single space.
 */
export const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const tokenize = (value: string): string[] => {
  const normalized = normalize(value);
  return normalized.length === 0 ? [] : normalized.split(' ');
};

export const prepareRecords = (records: readonly SearchRecord[]): PreparedRecord[] =>
  records.map((record) => ({
    record,
    title: normalize(record.title),
    titleTerms: tokenize(record.title),
    keywordTerms: [...new Set(record.keywords.flatMap((keyword) => tokenize(keyword)))],
    descriptionTerms: [...new Set(tokenize(record.description))],
    pathTerms: [...new Set(tokenize(record.path))],
  }));

const matchTerms = (
  terms: readonly string[],
  term: string,
  exactWeight: number,
  prefixWeight: number,
): number => {
  let best = 0;
  for (const candidate of terms) {
    if (candidate === term) return exactWeight;
    if (
      prefixWeight > 0
      && term.length >= MIN_PREFIX_LENGTH
      && candidate.length > term.length
      && candidate.startsWith(term)
    ) {
      best = Math.max(best, prefixWeight);
    }
  }
  return best;
};

const scoreTerm = (prepared: PreparedRecord, term: string): number => {
  const title = matchTerms(prepared.titleTerms, term, FIELD_WEIGHTS.titleExact, FIELD_WEIGHTS.titlePrefix);
  const keyword = matchTerms(prepared.keywordTerms, term, FIELD_WEIGHTS.keywordExact, FIELD_WEIGHTS.keywordPrefix);
  const description = matchTerms(
    prepared.descriptionTerms,
    term,
    FIELD_WEIGHTS.descriptionExact,
    FIELD_WEIGHTS.descriptionPrefix,
  );
  const path = matchTerms(prepared.pathTerms, term, FIELD_WEIGHTS.pathExact, 0);
  return title + keyword + description + path;
};

const scoreRecord = (prepared: PreparedRecord, terms: readonly string[], phrase: string) => {
  let total = 0;
  let matchedTerms = 0;

  for (const term of terms) {
    const termScore = scoreTerm(prepared, term);
    if (termScore > 0) matchedTerms += 1;
    total += termScore;
  }

  if (matchedTerms === 0) return { score: 0, matchedTerms };

  if (prepared.title === phrase) total += PHRASE_BONUS.titleEquals;
  else if (prepared.title.startsWith(phrase)) total += PHRASE_BONUS.titleStartsWith;
  else if (prepared.title.includes(phrase)) total += PHRASE_BONUS.titleContains;

  return { score: total, matchedTerms };
};

const byRelevance = (left: SearchResult, right: SearchResult) =>
  right.score - left.score
  || left.record.title.length - right.record.title.length
  || left.record.title.localeCompare(right.record.title);

/**
 * Ranks records against a raw user query. Records matching every query term win;
 * if nothing matches all of them, partial matches are returned rather than an
 * empty page, which is the common case for multi-word game names.
 */
export const searchRecords = (
  records: readonly SearchRecord[] | readonly PreparedRecord[],
  query: string,
  options: SearchOptions = {},
): SearchResult[] => {
  const limit = options.limit ?? 25;
  const trimmed = query.slice(0, MAX_QUERY_LENGTH);
  const terms = tokenize(trimmed);
  if (terms.length === 0 || limit <= 0) return [];

  const prepared: PreparedRecord[] = records.length > 0 && 'record' in (records[0] as object)
    ? records as PreparedRecord[]
    : prepareRecords(records as readonly SearchRecord[]);

  const phrase = normalize(trimmed);
  const complete: SearchResult[] = [];
  const partial: SearchResult[] = [];

  for (const candidate of prepared) {
    const { score, matchedTerms } = scoreRecord(candidate, terms, phrase);
    if (score <= 0) continue;
    const result = { record: candidate.record, score };
    if (matchedTerms === terms.length) complete.push(result);
    else partial.push(result);
  }

  const ranked = complete.length > 0 ? complete : partial;
  return ranked.sort(byRelevance).slice(0, limit);
};

/**
 * Build-time invariant check. Mirrors `validateOperations`: a malformed index
 * should fail the build rather than ship a search page that silently drops pages.
 */
export const validateSearchIndex = (records: readonly SearchRecord[]): SearchRecord[] => {
  if (records.length === 0) throw new Error('The search index is empty.');

  const seen = new Set<string>();
  for (const record of records) {
    if (!/^\/.*\/$/.test(record.path)) {
      throw new Error(`Search record path must be an absolute directory path: ${record.path}`);
    }
    if (seen.has(record.path)) throw new Error(`Search record is indexed twice: ${record.path}`);
    seen.add(record.path);

    if (record.title.trim().length === 0) throw new Error(`Search record has no title: ${record.path}`);
    if (record.description.trim().length === 0) throw new Error(`Search record has no description: ${record.path}`);
    if (tokenize(record.title).length === 0) throw new Error(`Search record title has no searchable term: ${record.path}`);
  }

  return [...records];
};
