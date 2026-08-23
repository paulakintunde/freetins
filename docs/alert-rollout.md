# Alert rollout

## Product contract

Alerts are a trust-first channel hub, not a promise to notify users through channels that have not been built. The current order is:

1. **Discord:** public instant posts for editor-published verified releases.
2. **RSS:** public, zero-PII Atom feeds for verified aggregated releases.
3. **Email:** optional, double-opt-in weekly digest through Amazon SES after its feedback and digest stages are complete.
4. **Web Push:** only after a service worker, real push-subscription storage, permission education, frequency caps, and delivery monitoring exist.

The site must never say that browser notifications are enabled unless a real `PushSubscription` is stored, and must never claim Discord is available without the configured destination.

## Implemented now

- `/alerts` describes the channels honestly and collects only the optional email digest subscription.
- `POST /api/alerts` creates or replaces a seven-day pending request and publishes only its request ID to `freetins-alert-email`.
- The `freetins-alert-delivery` Worker fetches the request from D1 and sends its confirmation email with SES v2. Email addresses, credentials, and usable tokens never enter a Queue payload or logs.
- `/alerts/confirm` validates the HMAC-signed, expiring confirmation link and creates the active subscription with a private management link.
- `/feeds/releases.xml` and `/feeds/{game}.xml` expose Atom feeds from immutable `alert_releases` records.
- The public Discord invite is available from `/alerts` and the mobile drawer. The webhook remains server-only until release publishing is implemented.
- The mobile drawer no longer makes a pretend browser-permission request.

## Before production sending

1. Apply `0002_alert_delivery.sql` to the production D1 database.
2. Create the `freetins-alert-email` and `freetins-alert-email-dlq` Queues, bind the first as `ALERT_EMAIL` to Pages, and deploy the separate delivery Worker as its consumer.
3. Verify the SES sending domain with DKIM, SPF, DMARC, and a custom MAIL FROM domain. Obtain production access before enabling public signup.
4. Set the shared `ALERT_CONFIRMATION_SECRET` in both Pages and the Worker. Set AWS and SES values only as Worker secrets/variables.
5. Send a confirmation to an SES mailbox simulator and a real controlled inbox. Verify expiry, replay behavior, pause, update, and deletion.
6. Do not enable the weekly-digest scheduler until an authenticated editorial publishing operation creates `alert_releases`, bounce/complaint processing exists, and a load test proves the configured SES quota is respected.

## Weekly digest release gate

The schema and delivery ledger reserve `weekly_digest` for the next stage, but no digest scheduler is enabled yet. That is intentional: release records are not currently published by an authenticated editorial workflow, so sending would either be empty or invent data. Build the publishing flow, SES feedback webhook, unsubscribe headers, quota-aware batch worker, and operational monitoring before turning the scheduled sender on.

## Discord and push gates

Discord's public invite is configured. Store its rotated webhook URL as `DISCORD_RELEASE_WEBHOOK_URL` in the delivery Worker's secrets, not as a Pages variable and never in source control. The forthcoming release-publish worker will be the only code permitted to read it. Web Push needs the implementation and verification stages in `docs/push-alert-delivery-plan.md`. Neither is a fallback for email and neither silently enrolls subscribers.
