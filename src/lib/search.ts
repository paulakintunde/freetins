import { routeDefinitions, type RouteDefinition } from '../data/routes';

export interface SearchResult {
  path: string;
  heading: string;
  description: string;
  category: string;
  score: number;
}

const hiddenKinds = new Set(['queue', 'manage', 'search']);

const categoryLabels: Partial<Record<RouteDefinition['kind'], string>> = {
  hub: 'Game',
  codes: 'Codes',
  values: 'Values',
  archive: 'Archive',
  daily: 'Daily links',
  dailyGame: 'Daily links',
  guide: 'Guide',
  cheat: 'Cheats',
  cheats: 'Cheats',
  gearCategory: 'Gear',
  gearProduct: 'Gear',
  author: 'Editorial team',
};

const normalize = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const searchableRoutes = routeDefinitions.filter((definition) =>
  !hiddenKinds.has(definition.kind) && !definition.noindex,
);

const scoreRoute = (definition: RouteDefinition, normalizedQuery: string, tokens: string[]) => {
  const heading = normalize(definition.heading);
  const name = normalize(definition.name ?? '');
  const slug = normalize(definition.slug ?? '');
  const description = normalize(definition.description);
  const combined = `${heading} ${name} ${slug} ${description}`;
  if (!tokens.every((token) => combined.includes(token))) return 0;

  let score = 20;
  if (name === normalizedQuery || heading === normalizedQuery) score += 120;
  if (name.startsWith(normalizedQuery) || heading.startsWith(normalizedQuery)) score += 70;
  if (heading.includes(normalizedQuery) || slug.includes(normalizedQuery)) score += 40;
  score += tokens.filter((token) => heading.includes(token)).length * 12;
  if (definition.kind === 'hub') score += 10;
  return score;
};

export const searchSite = (query: string, limit = 24): SearchResult[] => {
  const normalizedQuery = normalize(query).slice(0, 100);
  const tokens = normalizedQuery.split(' ').filter((token) => token.length > 1);
  if (tokens.length === 0) return [];

  return searchableRoutes
    .map((definition) => ({ definition, score: scoreRoute(definition, normalizedQuery, tokens) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score
      || left.definition.heading.localeCompare(right.definition.heading))
    .slice(0, limit)
    .map(({ definition, score }) => ({
      path: definition.path,
      heading: definition.heading,
      description: definition.description,
      category: categoryLabels[definition.kind] ?? 'Freetins',
      score,
    }));
};
