<?xml version="1.0" encoding="UTF-8"?>
<!--
  The sitemap, for people.

  A crawler reads the XML and never runs this: XSLT is applied by browsers only. So
  nothing here can change what is advertised or how it is read, and it is referenced
  from the index and from every section file purely so that opening one in a browser
  shows a table rather than a wall of markup.

  One stylesheet serves both document types. The index is a `<sitemapindex>` of
  sitemap files; a section file is a `<urlset>` of pages. The templates below match
  on which of the two arrived.

  Served as `text/xsl` by a rule in `public/_headers`. The site sends
  `X-Content-Type-Options: nosniff`, so a stylesheet delivered under any other type
  is refused by the browser and the page falls back to raw XML — no error, just the
  markup. The inline `<style>` below is covered by `style-src 'unsafe-inline'` in the
  site's Content-Security-Policy; the stylesheet itself is same-origin, which is what
  `style-src 'self'` requires of it.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          <xsl:choose>
            <xsl:when test="sm:sitemapindex">Sitemap index — Freetins</xsl:when>
            <xsl:otherwise>Sitemap — Freetins</xsl:otherwise>
          </xsl:choose>
        </title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #ffffff;
            --fg: #16181d;
            --muted: #5c6370;
            --line: #e3e6ea;
            --accent: #1a5fd0;
            --head: #f6f7f9;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #14161a;
              --fg: #e8eaed;
              --muted: #9aa2af;
              --line: #2a2e36;
              --accent: #79a9ff;
              --head: #1c1f25;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 2rem 1.25rem 4rem;
            background: var(--bg);
            color: var(--fg);
            font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          main { max-width: 60rem; margin: 0 auto; }
          h1 { font-size: 1.35rem; margin: 0 0 .35rem; letter-spacing: -.01em; }
          .lede { margin: 0 0 1.5rem; color: var(--muted); font-size: .9rem; }
          .lede code {
            font: 12.5px/1 ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
            background: var(--head);
            border: 1px solid var(--line);
            border-radius: 4px;
            padding: .15rem .35rem;
          }
          .wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; }
          table { border-collapse: collapse; width: 100%; font-size: .9rem; }
          th, td {
            text-align: left;
            padding: .6rem .85rem;
            border-bottom: 1px solid var(--line);
            white-space: nowrap;
          }
          th {
            background: var(--head);
            font-weight: 600;
            font-size: .78rem;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: var(--muted);
          }
          tr:last-child td { border-bottom: 0; }
          td.n { color: var(--muted); font-variant-numeric: tabular-nums; width: 1%; }
          td.url { white-space: normal; word-break: break-word; }
          td.when { color: var(--muted); font-variant-numeric: tabular-nums; }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; }
          footer { margin-top: 1.25rem; color: var(--muted); font-size: .82rem; }
        </style>
      </head>
      <body>
        <main>
          <xsl:apply-templates select="sm:sitemapindex" />
          <xsl:apply-templates select="sm:urlset" />
        </main>
      </body>
    </html>
  </xsl:template>

  <!-- The index: one row per section file. -->
  <xsl:template match="sm:sitemapindex">
    <h1>Sitemap index</h1>
    <p class="lede">
      <xsl:value-of select="count(sm:sitemap)" />
      <xsl:text> sitemaps, one per section. This is the file </xsl:text>
      <code>robots.txt</code>
      <xsl:text> points search engines at.</xsl:text>
    </p>
    <div class="wrap">
      <table>
        <tr><th></th><th>Sitemap</th><th>Last modified</th></tr>
        <xsl:for-each select="sm:sitemap">
          <tr>
            <td class="n"><xsl:value-of select="position()" /></td>
            <td class="url">
              <a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
            </td>
            <td class="when"><xsl:value-of select="substring(sm:lastmod, 1, 10)" /></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
    <footer>A date is shown only where the page beneath it records a check.</footer>
  </xsl:template>

  <!-- A section file: one row per page. -->
  <xsl:template match="sm:urlset">
    <h1>Sitemap</h1>
    <p class="lede">
      <xsl:value-of select="count(sm:url)" />
      <xsl:text> URLs. Part of the </xsl:text>
      <a href="/sitemap-index.xml">sitemap index</a>
      <xsl:text>.</xsl:text>
    </p>
    <div class="wrap">
      <table>
        <tr><th></th><th>URL</th><th>Last modified</th></tr>
        <xsl:for-each select="sm:url">
          <tr>
            <td class="n"><xsl:value-of select="position()" /></td>
            <td class="url">
              <a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
            </td>
            <td class="when"><xsl:value-of select="substring(sm:lastmod, 1, 10)" /></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
    <footer>
      A date is shown only where the page records a check. A page with no recorded
      check carries no date, which is the rule holding rather than a gap.
    </footer>
  </xsl:template>
</xsl:stylesheet>
