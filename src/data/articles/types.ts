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

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  table?: ArticleTable;
  groups?: ArticleGroup[];
  steps?: string[];
  bullets?: string[];
  links?: ArticleLink[];
  note?: string;
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface EditorialArticle {
  path: string;
  routeId: string;
  section: 'answers' | 'guides' | 'resources';
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
