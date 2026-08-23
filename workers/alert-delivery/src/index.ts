/// <reference types="@cloudflare/workers-types" />

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { createSignedToken } from '../../../src/lib/security';

interface Env {
  DB: D1Database;
  SITE_URL: string;
  DISCORD_RELEASE_WEBHOOK_URL?: string;
  SES_REGION?: string;
  SES_FROM_ADDRESS?: string;
  SES_CONFIGURATION_SET?: string;
  ALERT_CONFIRMATION_SECRET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}

interface QueueMessage<Body> {
  body: Body;
  attempts: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
}

interface QueueBatch<Body> { messages: QueueMessage<Body>[]; }
interface ConfirmationJob { type: 'confirmation'; requestId: string; }
interface DiscordReleaseJob { type: 'discord_release'; releaseId: string; }
type DeliveryJob = ConfirmationJob | DiscordReleaseJob;
interface SignupRequestRow { id: string; email: string; status: 'pending' | 'confirmed' | 'expired'; expires_at: string; }
interface DeliveryRow { status: 'pending' | 'sent' | 'failed'; }
interface ReleaseRow { id: string; game_slug: string; code_ids_json: string; published_at: string; }
interface SubmissionRow { id: string; game: string; code: string; }
interface DispatchRow { status: 'pending' | 'sent' | 'failed'; }

class PermanentDeliveryError extends Error {}

const now = () => new Date().toISOString();
const retryDelay = (attempts: number) => Math.min(600, 60 * 2 ** Math.max(0, attempts - 1));

const isTransientDeliveryError = (error: unknown) => {
  if (error instanceof PermanentDeliveryError) return false;
  if (!(error instanceof Error)) return true;
  const status = (error as { $metadata?: { httpStatusCode?: number }; status?: number }).$metadata?.httpStatusCode
    ?? (error as { status?: number }).status;
  return error.name === 'ThrottlingException'
    || error.name === 'TooManyRequestsException'
    || error.name === 'ServiceUnavailableException'
    || error.name === 'TypeError'
    || status === 408 || status === 425 || status === 429 || (status !== undefined && status >= 500);
};

const getEmailConfiguration = (env: Env) => {
  const region = env.SES_REGION;
  const fromAddress = env.SES_FROM_ADDRESS;
  const confirmationSecret = env.ALERT_CONFIRMATION_SECRET;
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  if (!region || !fromAddress || !confirmationSecret || !accessKeyId || !secretAccessKey) {
    throw new PermanentDeliveryError('ses_delivery_configuration_missing');
  }
  return { region, fromAddress, confirmationSecret, accessKeyId, secretAccessKey };
};

const requireDiscordConfiguration = (env: Env) => {
  if (!env.DISCORD_RELEASE_WEBHOOK_URL) throw new PermanentDeliveryError('discord_delivery_configuration_missing');
};

const claimEmailDelivery = async (env: Env, deliveryId: string, requestId: string) => {
  const timestamp = now();
  const existing = await env.DB.prepare('SELECT status FROM alert_email_deliveries WHERE id = ?')
    .bind(deliveryId).first<DeliveryRow>();
  if (existing?.status === 'sent') return false;
  await env.DB.prepare(`
    INSERT INTO alert_email_deliveries (id, kind, request_id, status, attempts, created_at, updated_at)
    VALUES (?, 'confirmation', ?, 'pending', 1, ?, ?)
    ON CONFLICT (id) DO UPDATE SET status = 'pending', attempts = alert_email_deliveries.attempts + 1, updated_at = excluded.updated_at
  `).bind(deliveryId, requestId, timestamp, timestamp).run();
  return true;
};

const updateEmailDelivery = async (env: Env, deliveryId: string, status: 'sent' | 'failed', providerMessageId?: string, errorCode?: string) => env.DB.prepare(`
  UPDATE alert_email_deliveries SET status = ?, provider_message_id = ?, last_error_code = ?, updated_at = ? WHERE id = ?
`).bind(status, providerMessageId ?? null, errorCode ?? null, now(), deliveryId).run();

const sendConfirmation = async (env: Env, job: ConfirmationJob) => {
  const configuration = getEmailConfiguration(env);
  const request = await env.DB.prepare('SELECT id, email, status, expires_at FROM alert_subscription_requests WHERE id = ?')
    .bind(job.requestId).first<SignupRequestRow>();
  if (!request || request.status !== 'pending' || request.expires_at <= now()) return;
  const deliveryId = `confirmation:${request.id}`;
  if (!(await claimEmailDelivery(env, deliveryId, request.id))) return;
  const confirmationToken = await createSignedToken(request.id, configuration.confirmationSecret, new Date(request.expires_at));
  const confirmationUrl = `${env.SITE_URL.replace(/\/$/, '')}/alerts/confirm?t=${encodeURIComponent(confirmationToken)}`;
  const client = new SESv2Client({
    region: configuration.region,
    credentials: { accessKeyId: configuration.accessKeyId, secretAccessKey: configuration.secretAccessKey },
  });
  try {
    const response = await client.send(new SendEmailCommand({
      FromEmailAddress: configuration.fromAddress,
      Destination: { ToAddresses: [request.email] },
      ConfigurationSetName: env.SES_CONFIGURATION_SET,
      EmailTags: [{ Name: 'message_type', Value: 'alert_confirmation' }, { Name: 'request_id', Value: request.id }],
      Content: { Simple: {
        Subject: { Charset: 'UTF-8', Data: 'Confirm your Freetins weekly code digest' },
        Body: {
          Text: { Charset: 'UTF-8', Data: `Confirm your Freetins weekly code digest: ${confirmationUrl}\n\nThis link expires in seven days. If you did not request this, you can ignore this email.` },
          Html: { Charset: 'UTF-8', Data: `<p>Confirm your Freetins weekly code digest.</p><p><a href="${confirmationUrl}">Confirm email preferences</a></p><p>This link expires in seven days. If you did not request this, you can ignore this email.</p>` },
        },
      } },
    }));
    await updateEmailDelivery(env, deliveryId, 'sent', response.MessageId);
    console.log(JSON.stringify({ event: 'ses_confirmation_sent', requestId: request.id, deliveryId }));
  } catch (error) {
    const errorCode = error instanceof Error ? error.name : 'UnknownError';
    if (!isTransientDeliveryError(error)) {
      await updateEmailDelivery(env, deliveryId, 'failed', undefined, errorCode);
      throw new PermanentDeliveryError(errorCode);
    }
    throw error;
  } finally { client.destroy(); }
};

const parseCodeIds = (value: string) => {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => /^submission_[0-9a-f-]{36}$/.test(id)) : [];
  } catch { return []; }
};

const markDispatchAttempt = async (env: Env, releaseId: string) => env.DB.prepare(`
  UPDATE release_dispatches
  SET status = 'pending', attempts = attempts + 1, updated_at = ?
  WHERE release_id = ? AND channel = 'discord' AND status != 'sent'
`).bind(now(), releaseId).run();

const updateDispatch = async (env: Env, releaseId: string, status: 'pending' | 'sent' | 'failed', providerMessageId?: string, errorCode?: string) => env.DB.prepare(`
  UPDATE release_dispatches
  SET status = ?, provider_message_id = ?, last_error_code = ?,
    sent_at = CASE WHEN ? = 'sent' THEN ? ELSE sent_at END, updated_at = ?
  WHERE release_id = ? AND channel = 'discord'
`).bind(status, providerMessageId ?? null, errorCode ?? null, status, now(), now(), releaseId).run();

const sendDiscordRelease = async (env: Env, job: DiscordReleaseJob) => {
  requireDiscordConfiguration(env);
  const release = await env.DB.prepare('SELECT id, game_slug, code_ids_json, published_at FROM alert_releases WHERE id = ?')
    .bind(job.releaseId).first<ReleaseRow>();
  const dispatch = await env.DB.prepare("SELECT status FROM release_dispatches WHERE release_id = ? AND channel = 'discord'")
    .bind(job.releaseId).first<DispatchRow>();
  if (!release || !dispatch || dispatch.status === 'sent') return;
  await markDispatchAttempt(env, release.id);
  const codeIds = parseCodeIds(release.code_ids_json);
  if (codeIds.length === 0) throw new PermanentDeliveryError('release_has_no_valid_codes');
  const placeholders = codeIds.map(() => '?').join(', ');
  const result = await env.DB.prepare(`SELECT id, game, code FROM code_submissions WHERE id IN (${placeholders})`)
    .bind(...codeIds).all<SubmissionRow>();
  const byId = new Map(result.results.map((submission) => [submission.id, submission]));
  const submissions = codeIds.map((id) => byId.get(id)).filter((value): value is SubmissionRow => Boolean(value));
  if (submissions.length !== codeIds.length) throw new PermanentDeliveryError('release_codes_not_found');
  const firstSubmission = submissions[0];
  if (!firstSubmission) throw new PermanentDeliveryError('release_codes_not_found');
  const game = firstSubmission.game;
  const codes = submissions.map((submission) => `• \`${submission.code}\``).join('\n');
  const releaseUrl = `${env.SITE_URL.replace(/\/$/, '')}/roblox/${encodeURIComponent(release.game_slug)}/codes`;
  const response = await fetch(env.DISCORD_RELEASE_WEBHOOK_URL!, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Freetins Releases', allowed_mentions: { parse: [] },
      embeds: [{ title: `${game}: verified codes`, url: releaseUrl, description: `${codes}\n\nVerified and published ${new Date(release.published_at).toUTCString()}.`, color: 0x1f8f55, footer: { text: 'Freetins verified release' } }],
    }),
  });
  if (!response.ok) {
    const errorCode = `discord_http_${response.status}`;
    if (response.status === 429 || response.status >= 500) throw Object.assign(new Error(errorCode), { status: response.status });
    throw new PermanentDeliveryError(errorCode);
  }
  const payload = await response.json().catch(() => null) as { id?: string } | null;
  await updateDispatch(env, release.id, 'sent', payload?.id);
  console.log(JSON.stringify({ event: 'discord_release_sent', releaseId: release.id }));
};

export default {
  async queue(batch: QueueBatch<DeliveryJob>, env: Env) {
    for (const message of batch.messages) {
      try {
        if (message.body.type === 'confirmation' && message.body.requestId) await sendConfirmation(env, message.body);
        else if (message.body.type === 'discord_release' && message.body.releaseId) await sendDiscordRelease(env, message.body);
        else { message.ack(); continue; }
        message.ack();
      } catch (error) {
        const errorCode = error instanceof Error ? error.message : 'unknown_delivery_error';
        if (!isTransientDeliveryError(error)) {
          if (message.body.type === 'discord_release') await updateDispatch(env, message.body.releaseId, 'failed', undefined, errorCode);
          console.error(JSON.stringify({ event: 'delivery_failed_permanently', type: message.body.type, errorCode }));
          message.ack();
          continue;
        }
        console.error(JSON.stringify({ event: 'delivery_retry', type: message.body.type, errorCode }));
        message.retry({ delaySeconds: retryDelay(message.attempts) });
      }
    }
  },
};
