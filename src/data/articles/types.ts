export interface ArticleLink {
  label: string;
  href: string;
  description?: string;
}

export interface ArticleTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface ArticleGroup {
  heading: string;
  body: string;
}

export interface ArticleElement {
  name: string;
  recipes: string[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  table?: ArticleTable;
  groups?: ArticleGroup[];
  steps?: string[];
  bullets?: string[];
  links?: ArticleLink[];
  elementIndex?: ArticleElement[];
  note?: string;
}

export interface ArticleFaq {
  question: string;
  /**
   * Inline HTML, not plain text.
   *
   * Eight pages kept their FAQ as prose because the answers are full of commands
   * and file paths — `motherlode`, `/gamerule keepInventory true` — and a plain
   * string renders those with the backticks showing. The alternative was a markdown
   * renderer in the template, which means a dependency and a parse on every build
   * for a handful of inline spans, so the conversion happens once when an answer is
   * written instead.
   *
   * Inline only: `<code>`, `<strong>`, `<em>`, `<a>`. Anything block-level belongs in
   * the article body. Text is escaped before the tags go in, so an answer that says
   * `<` says it rather than opening an element. A plain-text answer is already valid
   * here and needs no change.
   */
  answer: string;
}

export interface EditorialArticle {
  /** Markdown body stored in the `articles` content collection. */
  contentSlug?: string;
  path: string;
  routeId: string;
  section: 'answers' | 'guides' | 'resources' | 'cheats' | 'daily' | 'gear' | 'legal' | 'about' | 'blog';
  /** Optional category crumb for editorial trees deeper than one section. */
  parent?: ArticleLink;
  /**
   * Links an editorial page to a game in the operational catalogue. Set it on an
   * answers article to surface an Answers tab on that game's code page.
   */
  gameSlug?: string;
  schemaType?: 'Article' | 'CollectionPage' | 'WebPage';
  title: string;
  heading: string;
  description: string;
  eyebrow: string;
  author: string;
  authorPath: string;
  publishedAt: string;
  reviewedAt: string;
  reviewLabel: string;
  quickAnswer: string;
  sections: ArticleSection[];
  faq?: ArticleFaq[];
  sources: ArticleLink[];
  related: ArticleLink[];
}
