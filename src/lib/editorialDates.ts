import type { EditorialArticle } from '../data/articles/types.ts';

type ArticleDates = Pick<EditorialArticle,
  'publishedAt' | 'publishedYear' | 'modifiedAt' | 'reviewedAt' | 'reviewLabel'>;

const exactDate = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const match = /^(\d{4}-\d{2}-\d{2})(?:T.*)?$/.exec(value);
  const milliseconds = Date.parse(value);
  if (!match || !Number.isFinite(milliseconds)
    || new Date(`${match[1]}T00:00:00Z`).toISOString().slice(0, 10) !== match[1]) {
    throw new Error(`Invalid editorial date: ${value}`);
  }
  return value;
};

const displayDate = (value: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));

export function editorialDates(article: ArticleDates) {
  const published = exactDate(article.publishedAt);
  const modified = exactDate(article.modifiedAt);
  const reviewed = exactDate(article.reviewedAt);
  const year = article.publishedYear;
  if (year !== undefined && (!Number.isInteger(year) || year < 1000 || year > 9999)) {
    throw new Error('Editorial publication year must have four digits');
  }
  if (published && year !== undefined && Number(published.slice(0, 4)) !== year) {
    throw new Error('Editorial publication date and year disagree');
  }
  if (modified && ((published && Date.parse(modified) < Date.parse(published))
    || (year !== undefined && Number(modified.slice(0, 4)) < year))) {
    throw new Error('Editorial modification predates publication');
  }
  const modificationDate = modified ?? reviewed;

  return {
    // A year must never become a fabricated January 1 publication timestamp.
    schema: {
      ...(published ? { datePublished: published } : {}),
      ...(modificationDate ? { dateModified: modificationDate } : {}),
    },
    publicationLabel: year !== undefined ? `First published in ${year}` : undefined,
    updateLabel: modified ? `Updated ${displayDate(modified)}` : undefined,
    reviewLabel: article.reviewLabel,
    feedDate: modified ?? published,
  };
}
