import { clearVision3Article } from './clear-vision-3';
import { gta5RadioStationsArticle } from './gta-5-radio-stations';
import { resourcesArticle } from './resources';
import { christmasEmojiArticle, guessEmojiArticle, littleAlchemyArticle, littleAlchemyEnergyArticle } from './traffic-answers';
import { guitarHero3Article, legoJurassicWorldArticle, pokemonEmeraldArticle } from './traffic-cheats';
import { doubleDownCasinoArticle } from './traffic-daily';
import { gta5DemoArticle, jurassicWorldGameArticle } from './traffic-guides';
import { howWeVerifyArticle } from './how-we-verify';
import { legalArticles } from './legal-pages';
import { importedEditorialArticles } from './imported';
import { cheatExpansionArticles } from './cheat-expansion';
import type { EditorialArticle } from './types';

export type { ArticleLink, EditorialArticle } from './types';

export const editorialArticles: EditorialArticle[] = [
  clearVision3Article,
  gta5RadioStationsArticle,
  legoJurassicWorldArticle,
  jurassicWorldGameArticle,
  guitarHero3Article,
  littleAlchemyArticle,
  doubleDownCasinoArticle,
  guessEmojiArticle,
  pokemonEmeraldArticle,
  gta5DemoArticle,
  christmasEmojiArticle,
  littleAlchemyEnergyArticle,
  resourcesArticle,
  howWeVerifyArticle,
  ...importedEditorialArticles,
  ...cheatExpansionArticles,
  ...legalArticles,
];

export const getArticleByPath = (path: string) =>
  editorialArticles.find((article) => article.path === path);
