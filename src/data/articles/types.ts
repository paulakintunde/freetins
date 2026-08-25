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
  answer: string;
}

export interface EditorialArticle {
  /** Markdown body stored in the `articles` content collection. */
  contentSlug?: string;
  path: string;
  routeId: string;
  section: 'answers' | 'guides' | 'resources' | 'cheats' | 'daily' | 'legal' | 'about' | 'blog';
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
