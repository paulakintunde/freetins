/*
 * Where an article's artwork goes inside its own body.
 *
 * The artwork used to open the page, above the byline and above the answer, and
 * it was 800px of an 839px desktop viewport (28d68be, 9f328cb). Moving it to the
 * end of the body fixed the fold and left the page with no picture until the
 * reader had finished reading. This puts it back inside the body, one heading
 * down, so the page shows what it is about without spending the fold on it.
 *
 * The anchor is the second `<h2>`, and the third when the first section is too
 * short to keep the artwork clear of the fold.
 *
 * `LEAD_FLOOR` is measured in characters rather than pixels because a template
 * runs at build time and has no viewport. Two proxies were tested against the
 * rendered position of the second heading on all 32 article pages:
 *
 *   - characters of body text before it: 0.49 to 3.15 px per character, a 6x
 *     spread, because a section of tables is far taller per character than a
 *     section of prose.
 *   - a per-block height estimate (p, li, tr, h3, img): mean absolute error
 *     691px and worst case 4311px, and biased low on every single page.
 *
 * Neither predicts pixels well, so this does not pretend to. The floor is a
 * blunt guard for a first section short enough to be worth worrying about, and
 * it is deliberately generous: the lowest second heading measured across the
 * whole site renders at 1006px against a 839px fold, so no page in the corpus
 * needs the fallback at all. It exists for the page that has not been written
 * yet. If it ever fires somewhere it should not, lower the number - a page that
 * takes the second heading is behaving normally.
 */
export const LEAD_FLOOR = 600;

const H2 = /<h2\b/gi;

/** Visible-text length of an HTML fragment. */
const textLength = (html: string): number =>
  html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;

export interface ArtSplit {
  before: string;
  after: string;
  /** Which heading the artwork was placed above, for the build log and tests. */
  anchor: 2 | 3;
}

/*
 * Splits rendered body HTML immediately before its second heading, or its third
 * when the lead is under the floor. Returns null when the body has fewer than two
 * headings, which is the caller's signal to leave the artwork after the body
 * rather than force it somewhere arbitrary.
 */
export const splitAtArtAnchor = (html: string): ArtSplit | null => {
  if (!html) return null;
  const offsets = [...html.matchAll(H2)].map((match) => match.index ?? -1).filter((index) => index >= 0);
  if (offsets.length < 2) return null;

  const second = offsets[1]!;
  const useThird = offsets.length > 2 && textLength(html.slice(0, second)) < LEAD_FLOOR;
  const cut = useThird ? offsets[2]! : second;

  return { before: html.slice(0, cut), after: html.slice(cut), anchor: useThird ? 3 : 2 };
};

/*
 * The same decision for the editorial renderer's structured sections, which are
 * objects rather than a string. Returns the index to insert the artwork before,
 * or null to leave it after the body.
 */
export const sectionArtIndex = (
  sections: { paragraphs?: string[] }[],
): number | null => {
  if (sections.length < 2) return null;
  const lead = (sections[0]?.paragraphs ?? []).join(' ').length;
  return lead < LEAD_FLOOR && sections.length > 2 ? 2 : 1;
};
