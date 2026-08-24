import { clearVision3Article } from './clear-vision-3';
import { gta5RadioStationsArticle } from './gta-5-radio-stations';
import { resourcesArticle } from './resources';
import type { EditorialArticle } from './types';

export type { ArticleLink, EditorialArticle } from './types';

export const editorialArticles: EditorialArticle[] = [
  clearVision3Article,
  gta5RadioStationsArticle,
  resourcesArticle,
];

export const getArticleByPath = (path: string) =>
  editorialArticles.find((article) => article.path === path);
