import type { AlertInput, ContactInput, SubmissionInput } from './forms';
import { createReferenceId, hmacSha256 } from './security';

export interface AlertSubscription {
  id: string;
  channel: 'email';
  contact: string;
  games: string[];
  status: 'active' | 'paused';
  confirmedAt: string | null;
  deliveryFrequency: 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface AlertSubscriptionRequest {
  id: string;
  email: string;
  games: string[];
  expiresAt: string;
}

interface AlertRow {
  id: string;
  channel: 'email';
  contact: string;
  games_json: string;
  status: 'active' | 'paused';
  confirmed_at: string | null;
  delivery_frequency: 'weekly';
  created_at: string;
  updated_at: string;
}

interface AlertRequestRow {
  id: string;
  email: string;
  games_json: string;
  expires_at: string;
}

export interface EditorialSubmission {
  id: string;
  game: string;
  gameSlug: string;
  code: string;
  sourceUrl: string | null;
  notes: string | null;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  reviewedAt: string | null;
  publishedReleaseId: string | null;
}

export interface EditorialDispatch {
  releaseId: string;
  gameSlug: string;
  codeIds: string[];
  publishedAt: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastErrorCode: string | null;
}

interface EditorialSubmissionRow {
  id: string;
  game: string;
  game_slug: string;
  code: string;
  source_url: string | null;
  notes: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  published_release_id: string | null;
}

interface EditorialDispatchRow {
  release_id: string;
  game_slug: string;
  code_ids_json: string;
  published_at: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  last_error_code: string | null;
}

const now = () => new Date().toISOString();

const parseGames = (value: string) => {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((game): game is string => typeof game === 'string')
      : [];
  } catch {
    return [];
  }
};

const toSubscription = (row: AlertRow): AlertSubscription => ({
  id: row.id,
  channel: row.channel,
  contact: row.contact,
  games: parseGames(row.games_json),
  status: row.status,
  confirmedAt: row.confirmed_at,
  deliveryFrequency: row.delivery_frequency,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toRequest = (row: AlertRequestRow): AlertSubscriptionRequest => ({
  id: row.id,
  email: row.email,
  games: parseGames(row.games_json),
  expiresAt: row.expires_at,
});

const toEditorialSubmission = (row: EditorialSubmissionRow): EditorialSubmission => ({
  id: row.id,
  game: row.game,
  gameSlug: row.game_slug,
  code: row.code,
  sourceUrl: row.source_url,
  notes: row.notes,
  status: row.status,
  createdAt: row.created_at,
  reviewedAt: row.reviewed_at,
  publishedReleaseId: row.published_release_id,
});

const toEditorialDispatch = (row: EditorialDispatchRow): EditorialDispatch => ({
  releaseId: row.release_id,
  gameSlug: row.game_slug,
  codeIds: parseGames(row.code_ids_json),
  publishedAt: row.published_at,
  status: row.status,
  attempts: row.attempts,
  lastErrorCode: row.last_error_code,
});

export const insertContactRequest = async (db: FreetinsDatabase, input: ContactInput) => {
  const id = createReferenceId('contact');
  await db.prepare(`
    INSERT INTO contact_requests (id, topic, email, message, source_path, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'new', ?)
  `).bind(id, input.topic, input.email, input.message, input.sourcePath, now()).run();
  return id;
};

export const insertCodeSubmission = async (db: FreetinsDatabase, input: SubmissionInput) => {
  const id = createReferenceId('submission');
  await db.prepare(`
    INSERT INTO code_submissions (id, game, game_slug, code, source_url, email, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).bind(id, input.game, input.gameSlug, input.code, input.sourceUrl, input.email, input.notes, now()).run();
  return id;
};

export const getEditorialQueue = async (db: FreetinsDatabase) => {
  const [pending, verified, dispatches] = await Promise.all([
    db.prepare(`
      SELECT id, game, game_slug, code, source_url, notes, status, created_at, reviewed_at, published_release_id
      FROM code_submissions WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100
    `).all<EditorialSubmissionRow>(),
    db.prepare(`
      SELECT id, game, game_slug, code, source_url, notes, status, created_at, reviewed_at, published_release_id
      FROM code_submissions
      WHERE status = 'verified' AND published_release_id IS NULL
      ORDER BY reviewed_at ASC LIMIT 100
    `).all<EditorialSubmissionRow>(),
    db.prepare(`
      SELECT rd.release_id, ar.game_slug, ar.code_ids_json, ar.published_at,
        rd.status, rd.attempts, rd.last_error_code
      FROM release_dispatches rd
      JOIN alert_releases ar ON ar.id = rd.release_id
      ORDER BY rd.updated_at DESC LIMIT 25
    `).all<EditorialDispatchRow>(),
  ]);

  return {
    pending: pending.results.map(toEditorialSubmission),
    verified: verified.results.map(toEditorialSubmission),
    dispatches: dispatches.results.map(toEditorialDispatch),
  };
};

export const reviewCodeSubmission = async (
  db: FreetinsDatabase,
  submissionId: string,
  status: 'verified' | 'rejected',
  reviewer: string,
) => {
  const result = await db.prepare(`
    UPDATE code_submissions
    SET status = ?, reviewed_at = ?, reviewed_by = ?
    WHERE id = ? AND status = 'pending'
  `).bind(status, now(), reviewer, submissionId).run() as { meta?: { changes?: number } };
  return (result.meta?.changes ?? 0) === 1;
};

export interface PublishedRelease {
  id: string;
  gameSlug: string;
}

export const createEditorialRelease = async (
  db: FreetinsDatabase,
  submissionIds: string[],
): Promise<PublishedRelease | null> => {
  if (submissionIds.length === 0 || submissionIds.length > 25) return null;

  const placeholders = submissionIds.map(() => '?').join(', ');
  const candidates = await db.prepare(`
    SELECT id, game, game_slug, code, source_url, notes, status, created_at, reviewed_at, published_release_id
    FROM code_submissions
    WHERE id IN (${placeholders})
  `).bind(...submissionIds).all<EditorialSubmissionRow>();
  const submissions = candidates.results.map(toEditorialSubmission);
  const firstSubmission = submissions[0];
  const gameSlug = firstSubmission?.gameSlug;
  if (
    submissions.length !== submissionIds.length
    || !gameSlug
    || submissions.some((submission) => submission.status !== 'verified'
      || submission.publishedReleaseId !== null
      || submission.gameSlug !== gameSlug)
  ) return null;

  const id = createReferenceId('release');
  const timestamp = now();
  await db.batch([
    db.prepare(`
      INSERT INTO alert_releases (id, game_slug, code_ids_json, published_at, queued_at, source_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, gameSlug, JSON.stringify(submissionIds), timestamp, timestamp, firstSubmission.sourceUrl),
    ...submissionIds.map((submissionId) => db.prepare(`
      INSERT INTO release_code_members (code_submission_id, release_id, created_at)
      VALUES (?, ?, ?)
    `).bind(submissionId, id, timestamp)),
    ...submissionIds.map((submissionId) => db.prepare(`
      UPDATE code_submissions SET published_release_id = ?
      WHERE id = ? AND status = 'verified' AND published_release_id IS NULL
    `).bind(id, submissionId)),
    db.prepare(`
      INSERT INTO release_dispatches (release_id, channel, status, attempts, created_at, updated_at)
      VALUES (?, 'discord', 'pending', 0, ?, ?)
    `).bind(id, timestamp, timestamp),
  ]);
  return { id, gameSlug };
};

export const requeueEditorialRelease = async (db: FreetinsDatabase, releaseId: string) => {
  const result = await db.prepare(`
    UPDATE release_dispatches
    SET status = 'pending', last_error_code = NULL, updated_at = ?
    WHERE release_id = ? AND channel = 'discord' AND status = 'failed'
  `).bind(now(), releaseId).run() as { meta?: { changes?: number } };
  return (result.meta?.changes ?? 0) === 1;
};

export const createAlertSubscriptionRequest = async (
  db: FreetinsDatabase,
  input: AlertInput,
  contactHashSecret: string,
) => {
  const timestamp = now();
  const id = createReferenceId('alert_request');
  const contactHash = await hmacSha256(input.email, contactHashSecret);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000).toISOString();
  const row = await db.prepare(`
    INSERT INTO alert_subscription_requests (
      id, email, contact_hash, games_json, status, created_at, expires_at
    ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
    ON CONFLICT (contact_hash) DO UPDATE SET
      id = excluded.id,
      email = excluded.email,
      games_json = excluded.games_json,
      status = 'pending',
      created_at = excluded.created_at,
      expires_at = excluded.expires_at,
      confirmed_at = NULL
    RETURNING id, email, games_json, expires_at
  `).bind(
    id,
    input.email,
    contactHash,
    JSON.stringify(input.games),
    timestamp,
    expiresAt,
  ).first<AlertRequestRow>();

  if (!row) throw new Error('Alert signup request was not persisted');
  return toRequest(row);
};

export const getAlertSubscriptionRequest = async (db: FreetinsDatabase, id: string) => {
  const row = await db.prepare(`
    SELECT id, email, games_json, expires_at
    FROM alert_subscription_requests
    WHERE id = ? AND status = 'pending' AND expires_at > ?
  `).bind(id, now()).first<AlertRequestRow>();
  return row ? toRequest(row) : null;
};

export const confirmAlertSubscriptionRequest = async (
  db: FreetinsDatabase,
  request: AlertSubscriptionRequest,
  manageTokenHash: string,
  contactHashSecret: string,
) => {
  const timestamp = now();
  const contactHash = await hmacSha256(request.email, contactHashSecret);
  const subscriptionId = createReferenceId('alert');
  const subscriptionStatement = db.prepare(`
    INSERT INTO alert_subscriptions (
      id, channel, contact, contact_hash, games_json, status, manage_token_hash,
      confirmed_at, delivery_frequency, created_at, updated_at
    ) VALUES (?, 'email', ?, ?, ?, 'active', ?, ?, 'weekly', ?, ?)
    ON CONFLICT (channel, contact_hash) DO UPDATE SET
      games_json = excluded.games_json,
      status = 'active',
      manage_token_hash = excluded.manage_token_hash,
      confirmed_at = excluded.confirmed_at,
      delivery_frequency = 'weekly',
      updated_at = excluded.updated_at
    RETURNING id
  `).bind(
    subscriptionId,
    request.email,
    contactHash,
    JSON.stringify(request.games),
    manageTokenHash,
    timestamp,
    timestamp,
  );

  const existing = await db.prepare(`
    SELECT id FROM alert_subscriptions WHERE channel = 'email' AND contact_hash = ?
  `).bind(contactHash).first<{ id: string }>();
  const resolvedId = existing?.id ?? subscriptionId;
  const gameStatements = request.games.map((game) => db.prepare(`
    INSERT OR IGNORE INTO alert_subscription_games (subscription_id, game_slug) VALUES (?, ?)
  `).bind(resolvedId, game));

  await db.batch([
    subscriptionStatement,
    db.prepare('DELETE FROM alert_subscription_games WHERE subscription_id = ?').bind(resolvedId),
    ...gameStatements,
    db.prepare(`
      UPDATE alert_subscription_requests SET status = 'confirmed', confirmed_at = ? WHERE id = ?
    `).bind(timestamp, request.id),
  ]);

  return resolvedId;
};

export const getAlertSubscription = async (db: FreetinsDatabase, manageTokenHash: string) => {
  const row = await db.prepare(`
    SELECT id, channel, contact, games_json, status, confirmed_at, delivery_frequency, created_at, updated_at
    FROM alert_subscriptions
    WHERE manage_token_hash = ?
  `).bind(manageTokenHash).first<AlertRow>();
  return row ? toSubscription(row) : null;
};

export const updateAlertGames = async (
  db: FreetinsDatabase,
  manageTokenHash: string,
  games: string[],
) => {
  const subscription = await db.prepare(`
    SELECT id FROM alert_subscriptions WHERE manage_token_hash = ?
  `).bind(manageTokenHash).first<{ id: string }>();
  if (!subscription) return;

  await db.batch([
    db.prepare(`
      UPDATE alert_subscriptions SET games_json = ?, updated_at = ? WHERE id = ?
    `).bind(JSON.stringify(games), now(), subscription.id),
    db.prepare('DELETE FROM alert_subscription_games WHERE subscription_id = ?').bind(subscription.id),
    ...games.map((game) => db.prepare(`
      INSERT INTO alert_subscription_games (subscription_id, game_slug) VALUES (?, ?)
    `).bind(subscription.id, game)),
  ]);
};

export const updateAlertStatus = async (
  db: FreetinsDatabase,
  manageTokenHash: string,
  status: 'active' | 'paused',
) => db.prepare(`
  UPDATE alert_subscriptions
  SET status = ?, updated_at = ?
  WHERE manage_token_hash = ?
`).bind(status, now(), manageTokenHash).run();

export const deleteAlertSubscription = async (db: FreetinsDatabase, manageTokenHash: string) =>
  db.prepare('DELETE FROM alert_subscriptions WHERE manage_token_hash = ?')
    .bind(manageTokenHash)
    .run();
