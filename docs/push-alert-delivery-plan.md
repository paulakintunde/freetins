# P0 item 7: push-first alert delivery plan

## Decision

Use standards-based Web Push as the primary channel for new-code alerts. Keep Amazon SES as an optional email digest and compatibility fallback for people who cannot or do not want to enable browser notifications.

Do not add Firebase's client SDK or require a Firebase project. The browser chooses its push service and returns a standards-based `PushSubscription`; the Freetins delivery Worker sends encrypted messages to that endpoint using VAPID. This works across compatible browser push services without coupling the data model to one browser vendor.

The alert event remains one aggregated game release, not one event per code. A release can contain several code IDs but creates at most one notification per matching device.

## Important distinction

This implementation requires two different kinds of worker:

- A **browser service worker**, served from `/service-worker.js`, runs on the user's device, receives push events, displays notifications, and opens the relevant release when clicked.
- A **Cloudflare Worker**, deployed under `workers/alert-delivery/`, consumes Queue messages, encrypts push payloads, and sends them to browser push-service endpoints.

Cloudflare Pages can publish Queue messages but cannot consume them, so the backend delivery Worker remains necessary. Neither worker is a separate website or traditional server.

## Current application gap

The existing drawer code requests `Notification` permission and presents the enabled state when permission is granted. It does not currently:

- Register a browser service worker.
- Create a `PushSubscription`.
- Save an endpoint or encryption keys to D1.
- Associate games with a device subscription.
- Send or receive a push message.

Permission alone must never be described as an active subscription. Show "Notifications on" only after the browser subscription has been stored successfully and confirmed by the API.

## Product behavior

1. A visitor selects games on `/alerts`.
2. The page recommends **Push notifications** and offers **Email digest** as an optional alternative.
3. The browser permission prompt appears only after the visitor explicitly selects "Enable push". Never prompt on page load or when the mobile drawer opens.
4. Supported desktop and Android browsers subscribe immediately after permission is granted.
5. On iPhone and iPad, explain how to add Freetins to the Home Screen first; Web Push is available to Home Screen web apps.
6. Each device has its own subscription and game preferences. The same person may subscribe separately on a phone and computer.
7. A new aggregated game release creates one notification per matching active device.
8. Clicking the notification opens the exact game-code page with the release identifier in the URL.
9. Users can mute games, pause all push alerts, or unsubscribe from `/alerts` on that device.
10. Email and push are never both enabled by default. Sending through both channels requires an explicit user choice.

## Notification policy

Use concise, non-sensitive lock-screen content:

```text
Title: 3 new Grow a Garden codes
Body: Rewards were verified moments ago. Tap to copy them.
URL: /roblox/grow-a-garden-codes?release=<releaseId>
```

Apply these controls:

- Aggregate all codes from the same game release for 15 to 30 minutes.
- Never notify for hourly rechecks, unchanged codes, expiry checks, or archive moves.
- Default to no more than two immediate notifications per device per day.
- Cap immediate notifications at 20 per device per month.
- Roll overflow into one on-site alert inbox entry or optional digest instead of discarding it.
- Add user-configurable quiet hours and store the timezone offset with the preference, not the push endpoint.
- Use a six-hour TTL for ordinary code drops so stale alerts expire.
- Use normal urgency by default and high urgency only for a genuinely short-lived reward.
- Set a stable topic/tag derived from the game slug so an undelivered older notification can be replaced by a newer release for that game.

## Browser and PWA foundation

Add these static assets to the Astro Pages application:

- `/manifest.webmanifest` with a stable `id`, `start_url`, `display: standalone`, theme colors, and 192px and 512px icons.
- `/service-worker.js` at the origin root so its scope covers the entire application.
- Maskable and Apple touch icons.
- A small offline fallback for notification-click navigation failures.

The service worker must handle:

- `push`: validate the payload and call `registration.showNotification()`.
- `notificationclick`: close the notification and focus or open the approved same-origin URL.
- `pushsubscriptionchange`: send replacement subscription details to the API when the browser provides them.
- Page startup: compare `pushManager.getSubscription()` with server state and repair a refreshed or missing subscription when possible.
- Activation/version upgrades without silently removing an existing push subscription.

Feature-detect `serviceWorker`, `PushManager`, and `Notification`. Do not use browser-name detection.

## Subscription flow

1. Register `/service-worker.js` after the page becomes interactive.
2. On the explicit enable action, request notification permission.
3. Call `registration.pushManager.subscribe()` with `userVisibleOnly: true` and the stable VAPID public key.
4. POST the endpoint, `p256dh` key, `auth` key, selected games, timezone, and a CSRF token to `/api/push-subscriptions`.
5. Store a SHA-256 endpoint hash for uniqueness and lookup.
6. Encrypt the endpoint and subscription keys at application level before writing them to D1 because the endpoint is a capability URL.
7. Return success only after D1 commits the subscription and game mappings.
8. Set a secure, HTTP-only, same-site device-management cookie containing an opaque token whose hash is stored in D1.

The public VAPID key may be shipped to browsers. Store `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `PUSH_DATA_KEY` only as Cloudflare Worker secrets. Keep a protected backup of the VAPID key pair; unplanned replacement can require devices to resubscribe.

## Data model

Keep email and push subscriptions separate because their credentials and lifecycle differ.

Add:

- `alert_releases(id, game_slug, code_ids_json, published_at, queued_at)` with an editorially generated immutable release ID.
- `push_subscriptions(id, endpoint_hash, endpoint_ciphertext, p256dh_ciphertext, auth_ciphertext, status, timezone, manage_token_hash, last_success_at, last_failure_code, created_at, updated_at)`.
- `push_subscription_games(subscription_id, game_slug)` with indexes on both columns and a unique pair.
- `push_deliveries(release_id, subscription_id, status, attempts, reserved_at, accepted_at, last_error_code, created_at, updated_at)` with a unique `(release_id, subscription_id)` constraint.

Statuses should distinguish `active`, `paused`, `expired`, and `revoked`. An accepted send is not proof that the user saw the notification.

Retain successful delivery rows for 14 to 30 days, retain failures long enough to investigate, and archive only aggregate metrics to R2. At million-device scale, partition delivery ledgers by month and hash bucket so no D1 database approaches its 10 GB limit.

## Delivery architecture

```text
Editorial release commit
        |
        v
Pages Queue producer: ALERT_RELEASES
        |
        v
Cloudflare fan-out Worker
        |
        v
Queue: PUSH_DELIVERY
        |
        v
Cloudflare push delivery Worker
        |
        v
Browser push services
        |
        v
Browser service worker -> visible notification
```

The fan-out Worker pages through indexed game mappings and inserts idempotent delivery rows. Each `PUSH_DELIVERY` Queue message should contain up to 50 delivery IDs, not endpoints or encryption keys.

The delivery Worker reads credentials from D1 just before sending, uses the reviewed `web-push` package under `nodejs_compat`, and limits concurrent outbound connections. Run a compatibility and bundle-size spike before adopting the package permanently.

## Delivery results and retries

- Treat a successful push-service response as accepted, not delivered or read.
- Mark HTTP 404 and 410 subscriptions expired and remove them from future fan-out.
- Retry HTTP 429 using `Retry-After` when supplied.
- Retry network failures and push-service 5xx responses with jittered Queue delays.
- Do not retry malformed payloads, encryption failures caused by invalid stored keys, or revoked subscriptions.
- Move exhausted delivery groups to `PUSH_DELIVERY_DLQ` for controlled replay.
- Record notification clicks with a release ID, but do not use invasive tracking or fingerprinting.

Do not send an email automatically when a push service accepts a message but the user does not open it. Push acceptance cannot reliably prove display or attention, so that fallback would create duplicates and fatigue.

## Cost model

Standard Web Push does not add a per-notification email-provider charge. Browser push services such as FCM are available without a per-message fee, and Apple does not require Developer Program membership for standards-based Web Push. Freetins still pays for Cloudflare Workers, Queues, D1, and storage.

Using the agreed expected frequency of ten aggregated releases per active subscription per month:

| Active push devices | Pushes per month | Approximate platform impact |
| ---: | ---: | --- |
| 100 | 1,000 | Inside the Workers Paid base allocation |
| 1,000 | 10,000 | Inside the base allocation |
| 100,000 | 1,000,000 | Usually inside Queue and D1 included usage with compact batching |
| 1,000,000 | 10,000,000 | Approximately $5 to $25 before storage, depending mainly on D1 writes and encryption CPU |

With 50 delivery IDs per Queue message, ten million pushes create approximately 200,000 Queue messages or 600,000 normal write/read/delete operations, below the current one-million-operation Workers Paid inclusion. The exact Worker CPU cost must be measured with a load test because payload encryption happens per device.

The cost advantage does not remove the need for frequency caps. Push notifications are more interruptive than email and aggressive behavior can lead users or browsers to revoke permission.

## Reach model

Push reach is based on devices that grant permission, not the number of site visitors. Model adoption instead of assuming every visitor subscribes:

| Active audience | 20% push adoption | 40% push adoption | 60% push adoption |
| ---: | ---: | ---: | ---: |
| 100,000 | 20,000 devices | 40,000 devices | 60,000 devices |
| 1,000,000 | 200,000 devices | 400,000 devices | 600,000 devices |

At one million active visitors and 40 percent adoption, the expected model generates four million push notifications monthly. If the remaining 60 percent explicitly choose SES email alerts, email volume becomes six million rather than ten million. Do not silently enroll non-push users into email.

## Security and privacy

- Treat push endpoints and encryption keys as personal, secret delivery data.
- Encrypt endpoint material at rest and never place it in Queue payloads or logs.
- Validate all notification URLs against the Freetins origin before displaying or opening them.
- Keep notification content suitable for a visible lock screen.
- Apply same-origin, CSRF, size, and rate-limit protections to subscription APIs.
- Use a stable VAPID identity and a real monitored contact address in `VAPID_SUBJECT`.
- Provide visible pause, per-game mute, quiet-hours, and unsubscribe controls.
- Delete expired endpoint ciphertext after a short investigation window and retain only aggregate metrics.

## Implementation stages

1. **Protocol spike:** create a temporary VAPID pair, send one push through a test Worker, and verify Chrome, Edge, Firefox, desktop Safari, Android, and an installed iOS Home Screen web app.
2. **PWA foundation:** add the manifest, icons, root service worker, update strategy, and same-origin notification-click handling.
3. **Subscription APIs:** add encrypted push storage, normalized game mappings, management cookie, pause, resume, update, and delete actions.
4. **Permission UX:** replace the current drawer permission behavior with an educational prompt on `/alerts`; cover unsupported, denied, granted-but-unsubscribed, active, expired, and iOS-install-required states.
5. **Aggregated releases:** replace per-code delivery events with immutable release events containing all code IDs from the same drop.
6. **Queue fan-out:** provision `ALERT_RELEASES`, `PUSH_DELIVERY`, and `PUSH_DELIVERY_DLQ`; fan out in bounded indexed pages and groups of 50 delivery IDs.
7. **Delivery Worker:** implement VAPID sending, bounded concurrency, TTL, urgency, topics, idempotent ledgers, endpoint cleanup, retries, and metrics.
8. **Frequency controls:** add quiet hours, per-day and per-month caps, game mutes, and overflow-to-inbox behavior before public rollout.
9. **Optional email:** retain SES only for explicitly selected digests and browser compatibility, using the same aggregated release records.
10. **Rollout:** internal devices, then 1 percent, 10 percent, 25 percent, and 100 percent while measuring opt-in, accepted sends, expired endpoints, clicks, disable rate, Queue age, and duplicate rate.

## Completion criteria

- No browser permission prompt appears without an explicit user action.
- The UI reports active only after the server stores a real `PushSubscription`.
- One aggregated game release creates at most one notification per matching active device.
- Unsupported and iOS-not-installed visitors receive a useful alternative rather than a broken button.
- 404 and 410 responses remove dead subscriptions from future fan-out.
- Rate limits and transient failures retry without blocking Pages requests.
- Notification clicks open the correct release page.
- Quiet hours and frequency caps are enforced server-side.
- Endpoints and keys never appear in logs, analytics, or Queue messages.
- A load test proves the one-million-device fan-out strategy before that scale is enabled.

## Primary references

- W3C Push API: https://www.w3.org/TR/push-api/
- IETF Web Push protocol, TTL, topics, and status handling: https://www.rfc-editor.org/rfc/rfc8030.html
- IETF Web Push encryption: https://www.rfc-editor.org/rfc/rfc8291.html
- Cloudflare Web Push example using VAPID and `web-push`: https://developers.cloudflare.com/agents/communication-channels/webhooks/push-notifications/
- Cloudflare Pages Queue producer limitation: https://developers.cloudflare.com/pages/functions/bindings/#queue-producers
- Apple standards-based Web Push guidance: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- WebKit iOS and iPadOS Home Screen Web Push: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- Cloudflare Queue pricing: https://developers.cloudflare.com/queues/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/
