import type { APIRoute } from 'astro';
import { editorialArticles } from '../data/articles';
import { listAllDatasetPages } from '../lib/datasetPages';
import { siteOrigin } from '../data/site';

export const prerender = true;

/*
 * The site's feed.
 *
 * A site whose product is data that changes daily had no feed at any conventional
 * path, which costs it the oldest distribution channel there is and one of the
 * routes AI crawlers use to find what changed.
 *
 * ## What is in it, and what is not
 *
 * Editorial articles and dataset-backed pages: the things a person would subscribe
 * to. Code pages are deliberately absent. They are the site's most valuable content
 * and also its most frequently rewritten - every recorded check moves their date -
 * so including them would push everything else out of a reader's client within a
 * day and turn a feed into a changelog. `/codes/` is browsable and in the sitemap;
 * it does not need to be in the feed to be found.
 *
 * ## Dates
 *
 * `pubDate` is the publication fact each source already holds - `publishedAt` for an
 * editorial article, the dataset's own `checkedAt` for a dataset page. Neither is
 * the build clock, and neither asserts that a check happened, so this adds no new
 * claim to the ones the pages already make (docs/adr/0003).
 */
const MAX_ITEMS = 50;

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

interface FeedItem {
  path: string;
  title: string;
  description: string;
  at: string;
}

export const GET: APIRoute = async () => {
  const datasetPages = await listAllDatasetPages();

  const items: FeedItem[] = [
    ...editorialArticles
      // Legal and about pages are not publications; a reader subscribing to a feed
      // does not want the privacy policy arriving in it.
      .filter((article) => !['legal', 'about', 'resources'].includes(article.section))
      .map((article) => ({
        path: article.path,
        title: article.heading,
        description: article.description,
        at: article.publishedAt,
      })),
    ...datasetPages.map((page) => ({
      path: page.path,
      title: page.heading,
      description: page.description,
      at: page.checkedAt,
    })),
  ]
    .filter((item) => item.at && !Number.isNaN(Date.parse(item.at)))
    .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
    .slice(0, MAX_ITEMS);

  /*
   * `lastBuildDate` is the newest item's date rather than the moment this ran. A
   * feed that re-dates itself on every deploy tells a reader something changed when
   * nothing did, which is the same class of untruth as a build-clock `dateModified`.
   */
  const lastBuild = items[0]?.at;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Freetins</title>
    <link>${siteOrigin}/</link>
    <description>Game codes, daily reward links, cheats, answers and guides, each entry with a source, a publication state and the date it was recorded.</description>
    <language>en</language>
    <atom:link href="${siteOrigin}/rss.xml" rel="self" type="application/rss+xml" />${
      lastBuild ? `\n    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>` : ''
    }
${items
  .map(
    (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${siteOrigin}${item.path}</link>
      <guid isPermaLink="true">${siteOrigin}${item.path}</guid>
      <description>${escape(item.description)}</description>
      <pubDate>${new Date(item.at).toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
