/*
 * One page, one graph, one WebPage node.
 *
 * Structured data is a graph, not a list of tags, and a consumer that merges it
 * strictly resolves every node by its `@id`. Two nodes sharing an `@id` are one
 * node with two values for the same property, which is not a thing that can be
 * true: the merge either picks one arbitrarily or drops the pair. This site
 * emitted exactly that on every article page for months — the layout declared
 * `{url}#webpage` named after the document title, the article template declared
 * `{url}#webpage` again named after the heading, in a second `@graph` in a
 * second script tag, and nothing anywhere read the two back together.
 *
 * So the layout owns the node. A template that knows something about the page
 * — the trail it sits at the end of, the entity it is about, when it was
 * written — hands those properties to the layout to merge, and hands its own
 * nodes to the same graph. It never declares a WebPage of its own.
 *
 * The ids are derived here for the same reason. The layout knew the page by its
 * request path and the templates knew it by the permalink they were handed;
 * those agree in every case that works and are a trailing slash apart in the
 * ones that do not, which would leave an Article pointing at a node no graph
 * contains. Now both go through `canonicalUrl`, so they agree by construction,
 * and `pnpm check:routes` reads every emitted graph back to prove it.
 */

/**
 * The one canonical form of a page's path: no `.html`, no `index` segment, one
 * trailing slash. `/guides/foo`, `/guides/foo.html` and `/guides/foo/` are the
 * same page and must produce the same URL, because that URL is both the
 * `rel=canonical` and the stem of every `@id` on the page.
 */
export function canonicalPath(pathname: string): string {
  const withoutExtension = pathname.replace(/\.html$/, '');
  const withoutIndex = withoutExtension.replace(/(^|\/)index$/, '$1');
  if (withoutIndex === '' || withoutIndex === '/') return '/';
  return withoutIndex.endsWith('/') ? withoutIndex : `${withoutIndex}/`;
}

/** The absolute canonical URL, from a request path or a stored permalink. */
export function canonicalUrl(pathname: string, site: URL | undefined): URL {
  return new URL(canonicalPath(pathname), site);
}

/**
 * The id of the page's single WebPage node. Templates reference it — as
 * `mainEntityOfPage`, as the thing a breadcrumb belongs to — and never declare
 * a second node under it.
 */
export function webPageId(url: URL | string): string {
  return `${url}#webpage`;
}
