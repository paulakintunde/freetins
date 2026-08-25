/*
 * Programmatic prose checks from the writer contract.
 *
 * These run in the loader so a file that breaks the contract fails the build.
 * Checks run against the pre-interpolation body where the rule is about what
 * the writer typed, and against the rendered body where it is about output.
 */

const EM_DASH = /[—–]/g;

/** Literal dates and relative times belong in the dataset, never in prose. */
const LITERAL_DATE = new RegExp(
  [
    String.raw`\d{4}-\d{2}-\d{2}`,
    String.raw`\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b`,
    String.raw`\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b`,
    String.raw`\b(today|yesterday|tomorrow|last week|this week|right now this)\b`,
    String.raw`\b\d+\s+(minutes?|hours?|days?|weeks?|months?)\s+ago\b`,
  ].join('|'),
  'gi',
);

const BANNED_DOMAIN = /(example\.com|example\.invalid|freetins\.local|ceesty|clkmein|bit\.ly|tinyurl|cutt\.ly|shorte\.st|adf\.ly)/i;

const stripMarkdown = (value: string): string =>
  value
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_>#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const countWords = (value: string): number =>
  stripMarkdown(value).split(/\s+/).filter(Boolean).length;

/** Blocks separated by a blank line, with headings and tables removed. */
const paragraphsOf = (body: string): string[] =>
  body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block && !block.startsWith('#') && !block.startsWith('|') && !block.startsWith('{{'));

export const runProseChecks = (rawBody: string, renderedBody: string, label: string): string[] => {
  const problems: string[] = [];

  const emDashes = rawBody.match(EM_DASH);
  if (emDashes) {
    problems.push(`${label}: contains ${emDashes.length} em or en dash(es), the contract allows none`);
  }

  for (const match of rawBody.matchAll(LITERAL_DATE)) {
    problems.push(`${label}: literal date or relative time "${match[0]}" in prose, use a token instead`);
  }

  if (BANNED_DOMAIN.test(rawBody)) {
    problems.push(`${label}: prose links a banned or shortener domain`);
  }

  const paragraphs = paragraphsOf(rawBody);

  // The Answer Block is the first paragraph, written to be extracted whole.
  const answerBlock = paragraphs[0];
  if (!answerBlock) {
    problems.push(`${label}: no Answer Block found`);
  } else {
    const words = countWords(answerBlock);
    if (words < 40 || words > 55) {
      problems.push(`${label}: Answer Block is ${words} words, the range is 40 to 55`);
    }
  }

  // The Disambiguation Line follows it and must carry a verifiable identifier.
  const disambiguation = paragraphs[1];
  if (!disambiguation) {
    problems.push(`${label}: no Disambiguation Line found`);
  } else if (!/\bis not\b/i.test(disambiguation)) {
    problems.push(`${label}: Disambiguation Line must name what this entity is not`);
  } else if (!/\{\{entityId\}\}|\d{6,}|https:\/\//.test(disambiguation)) {
    problems.push(`${label}: Disambiguation Line must carry a verifiable identifier`);
  }

  // Required standout sections, matched on heading text.
  const headings = [...rawBody.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => (match[1] ?? '').toLowerCase());
  if (!headings.some((heading) => /could not verify/.test(heading))) {
    problems.push(`${label}: missing the "What we could not verify" section`);
  }
  if (!rawBody.includes('{{changelog}}')) {
    problems.push(`${label}: missing the Change Log block, add the changelog token`);
  }
  if (!rawBody.includes('{{recheckCadence}}') && !rawBody.includes('{{freshness}}')) {
    problems.push(`${label}: missing the Freshness Contract, add the recheckCadence token`);
  }

  // Internal links, counted on the rendered body so token output is included.
  const internalLinks = [...renderedBody.matchAll(/\]\((\/[^)]*)\)/g)].map((match) => match[1] ?? '');
  if (internalLinks.length < 3 || internalLinks.length > 8) {
    problems.push(`${label}: ${internalLinks.length} internal links, the range is 3 to 8`);
  }
  for (const href of internalLinks) {
    if (!/^\/.*\/$/.test(href.split('#')[0] ?? '')) {
      problems.push(`${label}: internal link "${href}" must be a directory path ending in a slash`);
    }
  }
  for (const match of renderedBody.matchAll(/\[([^\]]*)\]\(\/[^)]*\)/g)) {
    const anchor = (match[1] ?? '').trim();
    if (/^(click here|here|this|read more|link)$/i.test(anchor)) {
      problems.push(`${label}: non-descriptive link anchor "${anchor}"`);
    }
  }

  // A wall of text needs a heading, list or table breaking it up.
  let run = 0;
  for (const block of rawBody.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)) {
    const isProse = !/^(#|\||-|\d+\.|>|\{\{)/.test(block);
    run = isProse ? run + 1 : 0;
    if (run > 4) {
      problems.push(`${label}: more than four consecutive paragraphs without a heading, list or table`);
      break;
    }
  }

  return problems;
};
