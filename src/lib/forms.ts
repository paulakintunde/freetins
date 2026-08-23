import { gameCatalogue } from '../data/home';

export class FormError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'FormError';
    this.status = status;
  }
}

const allowedTopics = ['Correction', 'Promotion', 'Partnership', 'General'] as const;
const knownGameSlugs = new Set(gameCatalogue.map((game) => game.slug));
const gamesByName = new Map(gameCatalogue.map((game) => [game.name.toLowerCase(), game]));

const text = (form: FormData, key: string, maxLength: number) => {
  const value = form.get(key);
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength + 1);
};

const requiredText = (
  form: FormData,
  key: string,
  label: string,
  minLength: number,
  maxLength: number,
) => {
  const value = text(form, key, maxLength);
  if (value.length < minLength) throw new FormError(`${label} must be at least ${minLength} characters.`);
  if (value.length > maxLength) throw new FormError(`${label} must be ${maxLength} characters or fewer.`);
  return value;
};

const email = (form: FormData, required = true) => {
  const value = text(form, 'email', 254).toLowerCase();
  if (!value && !required) return null;
  if (value.length > 254) throw new FormError('Email must be 254 characters or fewer.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new FormError('Enter a valid email address.');
  }
  return value;
};

export interface ContactInput {
  topic: typeof allowedTopics[number];
  email: string;
  message: string;
  sourcePath: string;
}

export const parseContact = (form: FormData): ContactInput => {
  const topicValue = text(form, 'topic', 32);
  const topic = allowedTopics.find((candidate) => candidate === topicValue);
  if (!topic) throw new FormError('Choose a valid contact topic.');

  return {
    topic,
    email: email(form) ?? '',
    message: requiredText(form, 'message', 'Message', 10, 4_000),
    sourcePath: safeReturnPath(form, '/contact'),
  };
};

export interface SubmissionInput {
  game: string;
  gameSlug: string;
  code: string;
  sourceUrl: string | null;
  email: string | null;
  notes: string | null;
}

export const parseSubmission = (form: FormData): SubmissionInput => {
  const sourceUrlValue = text(form, 'source_url', 2_048);
  if (sourceUrlValue.length > 2_048) throw new FormError('Source link must be 2,048 characters or fewer.');
  let sourceUrl: string | null = null;
  if (sourceUrlValue) {
    try {
      const parsed = new URL(sourceUrlValue);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
      sourceUrl = parsed.toString();
    } catch {
      throw new FormError('Source link must be a complete http or https URL.');
    }
  }

  const notesValue = text(form, 'notes', 2_000);
  if (notesValue.length > 2_000) throw new FormError('Notes must be 2,000 characters or fewer.');

  const gameName = requiredText(form, 'game', 'Game name', 2, 120);
  const game = gamesByName.get(gameName.toLowerCase());
  if (!game) throw new FormError('Choose a game currently tracked by Freetins.');

  return {
    game: game.name,
    gameSlug: game.slug,
    code: requiredText(form, 'code', 'Code', 2, 120),
    sourceUrl,
    email: email(form, false),
    notes: notesValue || null,
  };
};

export interface AlertInput {
  email: string;
  games: string[];
}

export const parseAlert = (form: FormData): AlertInput => {
  const games = Array.from(new Set(
    form.getAll('games').filter((value): value is string => typeof value === 'string'),
  )).filter((slug) => knownGameSlugs.has(slug));

  if (games.length === 0) throw new FormError('Choose at least one game for alerts.');
  if (games.length > 25) throw new FormError('Choose no more than 25 games per alert.');

  return { email: email(form) ?? '', games };
};

export const parseManageAction = (form: FormData) => {
  const action = text(form, 'action', 16);
  if (!['update', 'pause', 'resume', 'delete'].includes(action)) {
    throw new FormError('Choose a valid alert action.');
  }
  return action as 'update' | 'pause' | 'resume' | 'delete';
};

export const parseManagedGames = (form: FormData) => {
  const games = Array.from(new Set(
    form.getAll('games').filter((value): value is string => typeof value === 'string'),
  )).filter((slug) => knownGameSlugs.has(slug));
  if (games.length === 0) throw new FormError('Choose at least one game for alerts.');
  if (games.length > 25) throw new FormError('Choose no more than 25 games per alert.');
  return games;
};

export const safeReturnPath = (form: FormData, fallback: string) => {
  const value = text(form, '_return', 160);
  return value.startsWith('/') && !value.startsWith('//') ? value : fallback;
};
