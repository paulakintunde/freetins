# Amazon SES email roadmap (future stage)

> The current production workflow is documented in [production-release-workflow.md](./production-release-workflow.md). This document is the future fan-out and weekly-digest design, not currently deployed behavior.

> Web Push is now the recommended primary code-alert channel. This document covers the optional email digest and compatibility fallback. See `docs/push-alert-delivery-plan.md` for the primary delivery architecture.

## Decision

Use Amazon Simple Email Service (SES) v2 as the email provider for users who explicitly select an email digest or cannot use Web Push. The Astro application on Cloudflare Pages will only create verified aggregated release events. A separate Cloudflare Worker will fan out subscriptions and send email through the SES HTTPS API.

SES can work with Cloudflare Pages because Pages Functions and Workers can make outbound HTTPS requests. Use the AWS SDK for JavaScript v3 SES v2 client with Cloudflare's `nodejs_compat` support and credentials stored as Worker secrets. Do not use SMTP from a page request.

This boundary is required for reliability: Pages can produce Cloudflare Queue messages, but a Pages project cannot be a Queue consumer. It also keeps SES latency, quota enforcement, and retries away from user-facing requests.

Resend remains a documented fallback only if SES production access cannot be obtained. Never send the same production alert through both providers.

## Target architecture

1. The editorial publish operation commits an aggregated game release and an immutable `alert_releases` row containing every verified code in that drop.
2. After the database commit succeeds, Pages publishes `{ releaseId, gameSlug, publishedAt }` to `ALERT_RELEASES`.
3. A fan-out Queue consumer selects matching active, verified subscriptions in bounded D1 pages.
4. The fan-out consumer inserts one `email_deliveries` row per release and subscription. A unique `(release_id, subscription_id)` constraint suppresses duplicate fan-out.
5. It publishes small recipient groups to `ALERT_EMAIL_BATCHES`. Queue messages contain delivery IDs and non-sensitive event identifiers, not recipient data, AWS credentials, or management tokens.
6. A dedicated delivery consumer reserves eligible delivery rows, checks the current SES quota budget, and sends through `SendEmail` or `SendBulkEmail`.
7. The delivery consumer records each SES result and message ID, acknowledges successful Queue work, and retries only retryable recipients.
8. SES bounce and complaint notifications arrive through an Amazon SNS HTTPS subscription at a dedicated Worker webhook.
9. The webhook verifies the SNS signature, processes each notification idempotently, and immediately suppresses hard-bounced or complained-about subscriptions.
10. Messages that exhaust retries move to `ALERT_EMAIL_DLQ` for inspection and controlled replay.

## Cloudflare resources

The Pages project receives only these additions:

- A producer binding for `ALERT_RELEASES`.
- The existing D1 database binding.
- No SES credentials and no Queue consumer configuration.

Create a separate Worker under `workers/alert-delivery/` with:

- Consumer access to `ALERT_RELEASES` and `ALERT_EMAIL_BATCHES`.
- Producer access to `ALERT_EMAIL_BATCHES`.
- D1 binding `DB`, shared with the Pages project.
- Dead-letter queue `ALERT_EMAIL_DLQ`.
- `nodejs_compat` and observability enabled.
- Worker variables `SES_REGION`, `SES_FROM_ADDRESS`, and `SES_CONFIGURATION_SET`.
- Worker secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `ALERT_UNSUBSCRIBE_SECRET`.

The IAM identity must be limited to the selected SES region and only the required actions: `ses:SendEmail`, `ses:SendBulkEmail`, and `ses:GetAccount`. Rotate the access key on a documented schedule. Never expose AWS credentials to browser code or ordinary Pages Functions.

## SES setup

1. Select one SES-supported AWS region. SES quotas and verified identities are regional, so keep the SES identity, configuration set, and SNS topics in that region.
2. Verify the sending domain and enable Easy DKIM.
3. Configure a custom MAIL FROM domain, SPF, and DMARC alignment.
4. Request SES production access. The sandbox permits only verified recipients, with a default limit of 200 recipients per rolling 24 hours and one recipient per second.
5. Create an SES configuration set for delivery, bounce, complaint, reject, and rendering-failure events.
6. Route bounce and complaint events to SNS, subscribe the Worker HTTPS webhook, and complete SNS subscription confirmation securely.
7. Use the SES mailbox simulator for bounce and complaint tests while the account remains in the sandbox.

## Data migration

Add these tables before enabling the producer:

- `alert_subscription_games(subscription_id, game_slug)`, indexed by `game_slug`, replacing JSON scans during fan-out.
- `alert_releases(id, game_slug, code_ids_json, published_at, queued_at)` with one immutable ID per aggregated game drop.
- `email_deliveries(id, release_id, subscription_id, provider, provider_message_id, status, attempts, reserved_at, sent_at, last_error_code, created_at, updated_at)` with unique `(release_id, subscription_id)`.
- `alert_provider_events(provider_event_id, delivery_id, event_type, received_at, payload_hash)` with unique `provider_event_id`.

Backfill `alert_subscription_games` from the existing `games_json`, then update signup and management writes to maintain the normalized table. Keep `games_json` for one release as rollback protection.

The existing management token is stored only as a hash and therefore cannot be reconstructed for an email link. Generate a separate, short-lived HMAC-signed unsubscribe token from the subscription ID, expiry, and token version. It may only pause or unsubscribe that subscription and must not grant access to the full alert manager. Include both a visible unsubscribe URL and one-click `List-Unsubscribe` headers.

## Quota-aware spacing and batching

SES counts recipients, not API calls. A 10-recipient bulk request consumes 10 units of the per-second and rolling 24-hour quotas.

Use these initial rules:

- In sandbox and staging, send one recipient per `SendEmail` request.
- In production, start `SendBulkEmail` at 10 recipients per request. Each entry has its own destination, template data, delivery ID, and unsubscribe URL.
- Never place unrelated recipients together in `To`, `CC`, or `BCC` on a normal `SendEmail` call.
- Keep the hard bulk cap at 50 recipients, which is the SES API limit, but increase above 10 only after quota and failure tests show it is safe.
- Configure the email Queue consumer with `max_batch_size = 1` and `max_concurrency = 1` initially. One Queue message may represent one SES bulk request.

At startup and at least every five minutes, call SES `GetAccount` and read `MaxSendRate`, `Max24HourSend`, and `SentLast24Hours`. Cache this non-secret quota snapshot briefly in KV or D1.

Calculate the pacing budget as:

```text
safeRate = MaxSendRate * 0.80
spacingMs = ceil((recipientCount / safeRate) * 1000)
remainingDaily = Max24HourSend - SentLast24Hours
```

After each SES request, use `scheduler.wait(spacingMs)` before completing the Queue batch. If `remainingDaily` cannot cover the next recipient group, retry that Queue message with a delayed delivery instead of sending or dropping it. Queue backlog age must be monitored so the team can see when the daily quota is too small.

The single-concurrency consumer is the first production rate gate. If more delivery consumers are later required, introduce one Durable Object as a regional token bucket before raising concurrency. Do not coordinate quota with process-global memory because Worker isolates are not shared or durable.

## Retry and partial-failure policy

- `SendBulkEmail` returns an outcome for every destination. Mark successful delivery rows sent and create a new retry message containing only retryable failed entries.
- Retry timeouts, network failures, SES `ThrottlingException`, and provider 5xx failures with jittered delays of approximately 60, 120, 300, and 600 seconds, then continue at 10-minute intervals up to eight attempts.
- Do not retry invalid addresses, rejected content, hard bounces, complaints, missing templates, or authorization errors.
- Move exhausted messages to `ALERT_EMAIL_DLQ` and alert on DLQ depth and oldest-message age.
- Claim a delivery row before sending and record the SES message ID immediately afterward. A unique delivery key prevents ordinary duplicate Queue processing.

SES does not provide an idempotency key for sending. A network failure after SES accepts a message but before the Worker records the response creates a small unavoidable duplicate window. Keep batches small, attach a unique `X-Freetins-Delivery-ID` header, and delay ambiguous retries while checking the delivery ledger. The delivery guarantee is therefore at-least-once with duplicate suppression, not mathematically exactly-once.

## Feedback, security, and privacy

- Validate SNS message signatures and certificate origins before trusting subscription confirmations or notifications.
- Store SNS provider event IDs and ignore duplicates.
- Pause a subscription immediately after a hard bounce or complaint. Do not send to it again unless the address is re-verified through an explicit user action.
- Read recipient addresses from D1 immediately before sending. Never write email addresses, AWS credentials, raw unsubscribe tokens, or management tokens to Queue messages or logs.
- Log event IDs, delivery IDs, SES request IDs, response classes, recipient counts, and timings.
- Set retention periods for delivery and provider-event rows, then purge them with a scheduled Worker.
- Track send success, throttle count, retry count, bounce rate, complaint rate, Queue depth, oldest message age, DLQ depth, and remaining daily quota.

## Implementation stages

1. **AWS groundwork:** verify the domain, configure DKIM/SPF/DMARC, request production access, create the configuration set and SNS topics, and install least-privilege credentials as Worker secrets.
2. **Compatibility spike:** deploy a non-production Worker using `@aws-sdk/client-sesv2`, call `GetAccount`, and send to the SES mailbox simulator. Confirm bundle size, signing, region configuration, and `nodejs_compat` before building the full worker.
3. **Schema and unsubscribe:** add normalized game mappings, event and delivery ledgers, provider event storage, and the restricted signed unsubscribe flow.
4. **Queue fan-out:** provision both Queues and the DLQ, add the producer after the code-publish transaction, and fan out in bounded D1 pages without sending email.
5. **SES delivery:** implement the quota cache, 80-percent rate gate, one-recipient staging mode, 10-recipient production batches, per-recipient result handling, and delayed retries.
6. **Feedback loop:** expose the SNS webhook, verify signatures, deduplicate notifications, and suppress bounces and complaints.
7. **Verification:** test duplicate events, a Worker crash, timeout after send, throttling, exhausted daily quota, partial bulk failure, hard bounce, complaint, unsubscribe, and DLQ replay.
8. **Rollout:** send to an internal allowlist, then enable 5 percent, 25 percent, and 100 percent of eligible subscriptions while observing quota headroom and Queue age.

## Completion criteria

Item 7 is complete only when:

- Publishing an aggregated verified release returns without waiting for SES.
- Every eligible subscriber receives a personalized HTML and plain-text alert.
- The consumer remains below 80 percent of the SES per-second quota during load tests.
- Daily quota exhaustion delays work without losing messages.
- Partial bulk failures retry only failed recipients.
- Hard bounces, complaints, and one-click unsubscribe prevent future sends.
- Duplicate Queue delivery does not create a second send in the tested non-ambiguous failure paths.
- DLQ replay, monitoring, key rotation, and rollback are documented and tested.

## Primary references

- Cloudflare Pages Queue bindings: https://developers.cloudflare.com/pages/functions/bindings/#queue-producers
- Cloudflare Pages Wrangler limitations: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- Cloudflare Queue batching and retries: https://developers.cloudflare.com/queues/configuration/batching-retries/
- Cloudflare dead-letter queues: https://developers.cloudflare.com/queues/configuration/dead-letter-queues/
- Cloudflare Worker scheduler: https://developers.cloudflare.com/workers/runtime-apis/scheduler/
- Amazon SES quotas: https://docs.aws.amazon.com/ses/latest/dg/quotas.html
- Amazon SES sending quota management: https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html
- Amazon SES quota errors: https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas-errors.html
- Amazon SES v2 bulk sending: https://docs.aws.amazon.com/ses/latest/dg/sesv2_example_sesv2_SendBulkEmail_section.html
- Amazon SES bounce and complaint notifications: https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity-using-notifications.html
- Amazon SES SNS notification setup: https://docs.aws.amazon.com/ses/latest/dg/configure-sns-notifications.html
