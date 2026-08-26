/*
 * The text a dataset page puts in its meta description.
 *
 * `unverifiedSummary` is a paragraph of caveats: what the page does not stand
 * behind and why. Bound straight to the description tag it ran to 870
 * characters and opened with "Nothing on this page is publisher confirmed",
 * which is what a search result then showed for the page. The writer's
 * front-matter `description` is the answer-first line meant for that slot.
 * When there is none, the summary is cut to snippet length here so nothing
 * longer than a snippet reaches the tag; the full paragraph stays in the body,
 * where it belongs.
 */
export const META_DESCRIPTION_LIMIT = 155;

const collapse = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * Cuts `text` to `limit` characters: at the last sentence end that fits when
 * that keeps at least half the limit, otherwise at a word boundary with an
 * ellipsis. Text already within the limit is returned untouched.
 */
export const clampDescription = (text: string, limit = META_DESCRIPTION_LIMIT): string => {
  const clean = collapse(text);
  if (clean.length <= limit) return clean;

  const head = clean.slice(0, limit + 1);
  const sentenceEnd = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  if (sentenceEnd + 1 >= limit / 2) return head.slice(0, sentenceEnd + 1);

  const room = head.slice(0, limit - 1);
  const wordEnd = room.lastIndexOf(' ');
  return `${(wordEnd > 0 ? room.slice(0, wordEnd) : room).replace(/[,;:]$/, '')}…`;
};

export interface DatasetMetaDescriptionInput {
  /** The writer's front-matter line, when there is one. */
  description?: string | undefined;
  unverifiedSummary?: string | undefined;
  title?: string | undefined;
}

export const datasetMetaDescription = (page: DatasetMetaDescriptionInput): string =>
  clampDescription(page.description || page.unverifiedSummary || page.title || '');
