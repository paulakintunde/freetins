# Production release workflow

This is the operational path for publishing a verified code release. It is intentionally split into a public Pages application and a queue-consuming Worker so page responses never wait for Discord or email providers.

## Roles and boundaries

- **Contributor:** submits a code and optional source through `/submit`.
- **Editor:** unlocks `/internal/queue`, verifies or rejects each submission, and selects verified codes from one game for a single release.
- **Pages Function:** commits the release and its Discord dispatch record to D1, then sends only `{ type: "discord_release", releaseId }` to `freetins-release-delivery`.
- **Alert Worker:** loads release data by ID, posts a Discord embed through the Worker secret, and records the outcome. It retries temporary failures and makes successful messages idempotent.

## Editor procedure

1. Open `/internal/queue` and unlock it with the configured editorial password.
2. Open each source, apply the two-source verification rule, then select **Verify** or **Reject**.
3. Under **Publish a release**, choose one or more verified codes for the same game.
4. Select **Publish to Discord**. The release is first saved in D1; delivery then happens asynchronously.
5. Check **Delivery ledger**. A `sent` state includes the provider response. A `failed` state may be retried after the cause is corrected.

An editor cannot publish a pending, rejected, already-published, or mixed-game selection. Every dispatch attempt and provider error remains in D1.

## AWS SES setup

Email remains disabled until this is complete. SES sends only the double-opt-in confirmation at this stage; the weekly-digest worker is deliberately not enabled yet.

1. In the AWS Console, choose one SES region and keep every SES setting in that region.
2. Open **Amazon SES** > **Configuration** > **Identities** > **Create identity**. Choose the Freetins sending domain, enable Easy DKIM, and publish the DNS records SES gives you.
3. Add SPF and DMARC for the same domain. Configure a custom MAIL FROM subdomain if you want fully aligned return paths.
4. Request production access in **SES** > **Account dashboard**. Until granted, SES sandbox mode can send only to verified recipient addresses.
5. Create a configuration set, for example `freetins-alerts`, with delivery, bounce, complaint, and reject event destinations. Do not enable public email intake until bounces and complaints have a real receiving webhook.
6. Go to **IAM** > **Users** > **Create user**. Create a programmatic user such as `freetins-ses-delivery`; do not use your AWS root account.
7. Attach an inline policy restricted to the chosen region and sender identity. Replace the placeholders before saving:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ses:SendEmail", "ses:SendBulkEmail"],
    "Resource": "arn:aws:ses:REGION:AWS_ACCOUNT_ID:identity/SENDING_DOMAIN"
  }]
}
```

8. Create an **access key** for that user. AWS shows the `Access key ID` and `Secret access key` once. Store both immediately in a password manager; the secret cannot be shown again.
9. In Cloudflare, open **Workers & Pages** > **freetins-alert-delivery** > **Settings** > **Variables and Secrets** and add:

| Name | Type | Value |
| --- | --- | --- |
| `SES_REGION` | Text variable | Your SES region, for example `us-east-1` |
| `SES_FROM_ADDRESS` | Text variable | A verified sender, for example `alerts@your-domain.com` |
| `SES_CONFIGURATION_SET` | Text variable | `freetins-alerts` (optional until events are configured) |
| `AWS_ACCESS_KEY_ID` | Secret | IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | Secret | IAM secret access key |
| `ALERT_CONFIRMATION_SECRET` | Secret | A new random 32+ byte value |

10. Set the **same** `ALERT_CONFIRMATION_SECRET` and a separate random `CONTACT_HASH_SECRET` in the `freetins` Pages project's Variables and Secrets. Only after the Worker can successfully send a controlled confirmation should you set `EMAIL_DIGEST_ENABLED=true` as a Pages text variable.

Never paste access keys, email passwords, or the Discord webhook URL into source code, git, browser code, or a Pages text variable.

## Required Cloudflare secrets

Store these on the `freetins` Pages project:

- `EDITOR_ACCESS_PASSWORD`: the editorial password.
- `EDITOR_ACCESS_SESSION_SECRET`: a unique random 32+ byte value.
- `CONTACT_HASH_SECRET`: a unique random 32+ byte value.
- `ALERT_CONFIRMATION_SECRET`: must exactly match the Worker secret when email is enabled.

Store these only on `freetins-alert-delivery` Worker:

- `DISCORD_RELEASE_WEBHOOK_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ALERT_CONFIRMATION_SECRET`

## Deploy order

1. Apply migration `0003_editorial_release_workflow.sql` to production D1.
2. Create the `freetins-release-delivery` and `freetins-release-delivery-dlq` Queues.
3. Deploy `freetins-alert-delivery` with the new release queue consumer and confirm the Discord webhook secret remains present.
4. Add the Pages producer binding and secrets, then deploy Pages when the real public content is ready.
5. Verify the whole path with one non-public test submission before publishing a real release.
