import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gameCatalogue, dailyLinkCatalogue } from '../data/home';
import { editorialArticles } from '../data/articles';
import { listAllDatasetPages } from '../lib/datasetPages';
import { siteOrigin } from '../data/site';

export const prerender = true;

/*
 * The expanded companion to /llms.txt.
 *
 * `llms.txt` explains the model: what a state means, what an evidence line means,
 * and that neither is typed by a writer. It says nothing about what is actually on
 * the site, so a model that reads it knows the rules and not the catalogue.
 *
 * This adds the catalogue, with each page's real counts, generated at build time.
 *
 * ## Why the prose is read rather than repeated
 *
 * The explanation lives in `public/llms.txt` and is read from there verbatim. Two
 * copies of a document whose entire purpose is to state the site's rules precisely
 * is two documents that will eventually disagree, and the one that disagrees would
 * be this one - the generated file nobody opens.
 *
 * ## Counts, not characterisations
 *
 * Every number below counts records. `listed` counts rows in the Listed state;
 * `verified` counts rows an editor accepted. Neither says a code works - that is
 * the row's own state to declare, and a count that characterised its rows would be
 * exactly the claim the state vocabulary exists to prevent (CLAUDE.md).
 */
const catalogueSection = (
  heading: string,
  note: string,
  rows: { name: string; path: string; listed: number; verified: number; expired: number }[],
) => {
  if (rows.length === 0) return '';
  const lines = rows
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(
      (row) =>
        `- [${row.name}](${siteOrigin}${row.path}): ${row.listed} listed, ${row.verified} verified by an editor, ${row.expired} expired`,
    );
  return `\n## ${heading}\n\n${note}\n\n${lines.join('\n')}\n`;
};

const plainSection = (heading: string, note: string, rows: { name: string; path: string }[]) => {
  if (rows.length === 0) return '';
  const lines = rows
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((row) => `- [${row.name}](${siteOrigin}${row.path})`);
  return `\n## ${heading}\n\n${note}\n\n${lines.join('\n')}\n`;
};

export const GET: APIRoute = async () => {
  const model = readFileSync(resolve('public/llms.txt'), 'utf8').trimEnd();
  const datasetPages = await listAllDatasetPages();

  const codes = gameCatalogue
    .filter((game) => game.isPublished)
    .map((game) => ({
      name: game.name,
      path: `/codes/${game.slug}/`,
      listed: game.listedCount,
      verified: game.verifiedCount,
      expired: game.expiredCount,
    }));

  const daily = dailyLinkCatalogue
    .filter((game) => game.isPublished)
    .map((game) => ({
      name: game.name,
      path: `/daily/${game.slug}/`,
      listed: game.listedCount,
      verified: game.verifiedCount,
      expired: game.expiredCount,
    }));

  const editorial = editorialArticles
    .filter((article) => !['legal', 'about'].includes(article.section))
    .map((article) => ({ name: article.heading, path: article.path }));

  const datasets = datasetPages.map((page) => ({ name: page.heading, path: page.path }));

  const totals = {
    codePages: codes.length,
    listed: codes.reduce((sum, row) => sum + row.listed, 0) + daily.reduce((sum, row) => sum + row.listed, 0),
    verified: codes.reduce((sum, row) => sum + row.verified, 0) + daily.reduce((sum, row) => sum + row.verified, 0),
    expired: codes.reduce((sum, row) => sum + row.expired, 0) + daily.reduce((sum, row) => sum + row.expired, 0),
  };

  const body = `${model}

---

# The catalogue

Generated from the operational record at build time. Every number counts records and
none of them characterises one: a listed row has not been tested by anyone here, and
a count of listed rows is not a count of working codes.

The site keeps records in two systems and they count differently, so they are
reported separately rather than added together.

**Operational records** back the ${totals.codePages} published code pages: ${totals.listed} rows listed,
${totals.verified} verified by an editor, ${totals.expired} expired. Only these carry an editor's star.

**Dataset-backed pages** carry rows whose state is the one they displayed when the
record began - "Active · as published" - rather than an editor's finding. A row there
with no recorded status shows as listed and awaiting verification, the same as a new
operational row. Those pages are listed below without counts, because a count that
mixed a baseline state with an editor's star would misrepresent both.
${catalogueSection(
  'Code pages',
  'One page per game. Each row is a code with its own state, evidence line and recorded date.',
  codes,
)}${catalogueSection(
  'Daily reward links',
  'Operational reward-link records. Empty today: the /daily/ pages are dataset-backed and appear under dataset pages below.',
  daily,
)}${plainSection(
  'Guides, answers, cheats and gear',
  'Editorial pages. These carry a byline and a review line rather than row states.',
  editorial,
)}${plainSection(
  'Dataset-backed pages',
  'Prose pages whose tables and counts are rendered from the dataset rather than typed.',
  datasets,
)}
## Methodology

The full verification policy, the state definitions and the corrections policy are at
${siteOrigin}/how-we-verify/.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
