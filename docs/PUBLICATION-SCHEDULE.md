# September content publication queue

All 25 commissioned topics are present in the workspace: 24 new pages and the existing Re:Rangers X route refreshed in place. Search samples and editorial decisions are in docs/research/september-2026. Images are original illustrations, not screenshots or redemption evidence.

## Schedule

The user's literal PST instruction means fixed UTC−08:00. During September this is one hour behind Vancouver's daylight time: 09:30 PST = 10:30 Vancouver, 14:30 PST = 15:30 Vancouver. The first day also has 19:30 PST = 20:30 Vancouver. The plan starts September 15, 2026, subject to the local computer being awake, Codex running, and the existing GitHub authentication being available.

| Order | Date and time (PST) | Topic | Canonical path |
| --- | --- | --- | --- |
| 1 | 2026-09-15 09:30 | blox-fruits-codes | /blog/blox-fruits-codes/ |
| 2 | 2026-09-15 14:30 | nba-2k27-locker-codes | /blog/nba-2k27-locker-codes/ |
| 3 | 2026-09-15 19:30 | steal-an-egg-codes | /blog/steal-an-egg-codes/ |
| 4 | 2026-09-16 09:30 | grand-blue-codes | /blog/grand-blue-codes/ |
| 5 | 2026-09-16 14:30 | evomon-codes | /blog/evomon-codes/ |
| 6 | 2026-09-17 09:30 | roblox-innovation-awards-2026-free-ugc | /blog/roblox-innovation-awards-2026-free-ugc/ |
| 7 | 2026-09-17 14:30 | fortnite-admin-panel-codes | /blog/fortnite-admin-panel-codes/ |
| 8 | 2026-09-18 09:30 | genshin-impact-codes | /blog/genshin-impact-codes/ |
| 9 | 2026-09-18 14:30 | pokemon-go-promo-codes | /blog/pokemon-go-promo-codes/ |
| 10 | 2026-09-19 09:30 | honkai-star-rail-codes | /blog/honkai-star-rail-codes/ |
| 11 | 2026-09-19 14:30 | zenless-zone-zero-codes | /blog/zenless-zone-zero-codes/ |
| 12 | 2026-09-20 09:30 | evomon-tier-list | /guides/evomon-tier-list/ |
| 13 | 2026-09-20 14:30 | anime-expeditions-codes | /blog/anime-expeditions-codes/ |
| 14 | 2026-09-21 09:30 | dungeon-lootr-codes | /blog/dungeon-lootr-codes/ |
| 15 | 2026-09-21 14:30 | catch-a-monster-codes | /blog/catch-a-monster-codes/ |
| 16 | 2026-09-22 09:30 | doors-codes | /blog/doors-codes/ |
| 17 | 2026-09-22 14:30 | fish-it-codes | /blog/fish-it-codes/ |
| 18 | 2026-09-23 09:30 | bee-swarm-simulator-codes | /blog/bee-swarm-simulator-codes/ |
| 19 | 2026-09-23 14:30 | adopt-me-codes | /blog/adopt-me-codes/ |
| 20 | 2026-09-24 09:30 | murder-mystery-2-codes | /blog/murder-mystery-2-codes/ |
| 21 | 2026-09-24 14:30 | re-rangers-x-codes | /codes/anime-ranger-x/ |
| 22 | 2026-09-25 09:30 | brookhaven-rp-guide | /guides/brookhaven-rp-guide/ |
| 23 | 2026-09-25 14:30 | gta-6-release-date | /guides/gta-6-release-date/ |
| 24 | 2026-09-26 09:30 | gta-6-cheat-codes | /cheats/gta-6-cheat-codes/ |
| 25 | 2026-09-26 14:30 | why-roblox-games-skip-codes | /blog/why-roblox-games-skip-codes/ |

One release is allowed per eligible half-hour slot. If a run is missed, the next slot publishes only the next queued topic; it never catches up several posts at once. The three-post exception follows the first actual publication day if sign-in delays the start. Later days have at most two releases. The table gives earliest planned slots; missed runs shift the remaining queue later.

## Build and deploy

Run from the repository root:

```powershell
node scripts/publish-scheduled.mjs --plan
node scripts/publish-scheduled.mjs --prepare --through=blox-fruits-codes --build
node scripts/publish-via-github.mjs
```

Preparation builds an isolated copy under output/publication/site. It includes already released topics and, for publishing, exactly one next topic. Pending Markdown and datasets are omitted from that copy, editorial registration is reduced to the included articles, and links to not-yet-published topics become ordinary text. All source content remains intact in the main workspace. Re:Rangers X retains its baseline prose, four existing entries and original artwork until its refresh slot.

The full collection can be reviewed locally using:

```powershell
$env:ASTRO_TELEMETRY_DISABLED = '1'
$env:FREETINS_FULL_CONTENT_REVIEW = '1'
pnpm build
pnpm dev
```

The normal pnpm build command creates the isolated released site and copies its checked output to root dist, preserving the existing Cloudflare build command. Full-review mode is only for local review and must not be set in Cloudflare. The GitHub publisher commits only the due article files and release record, pushes main, waits for the Cloudflare Pages check, confirms the live path, then records the actual deployment time. The user explicitly authorized GitHub pushes on September 14.

## Evidence and editorial handling

Refresh time-sensitive sources before each release, especially NBA locker codes, the HoYoverse livestream deadlines, Pokémon GO promotions and event recaps. Update attributed context from accessible sources; never write a successful redemption or verification timestamp without the actual recorded check. Verification never decides whether an article is accepted, rendered or indexed. This queue implements the publication times requested by the user.

The source articles are fully researched drafts, not a claim that every code was redeemed. Some primary pages need a signed-in client or return a JavaScript shell. Those limits and disagreements stay visible in the content.

## Failure and recovery

releases.json records confirmed deployments and their actual publication times. A publisher.lock prevents overlapping runs. pendingDeployment is written before the upload begins; an interrupted or ambiguous upload must be reconciled against Cloudflare before another attempt. Never clear it just to retry. Inspect the named deployment's new page, branch, canonical path and existing site routes; record its real deployment URL/time if it succeeded, or clear only after establishing that it did not publish.

If a process died before upload, inspect whether a publisher process is still running before removing its stale lock. The normal publisher always removes its lock when it exits. Preparation is read-only with respect to source content and never deploys.

## GitHub connection

The repository paulakintunde/freetins already has a Cloudflare Pages Git integration. Its main-branch Cloudflare check was confirmed successful on September 14. The local GitHub CLI is authenticated as paulakintunde. The scheduled publisher uses that existing connection and does not require a separate Cloudflare login.

If the optional direct Wrangler path is ever needed, renew with only account:read, user:read and pages:write scopes. The default broad OAuth request was rejected by automatic approval review; it was replaced by a narrower attempt and then superseded by the user-requested GitHub route.

The local scheduled task requires the computer awake, Codex running, usable account limits and GitHub authentication. It stays quiet on unchanged or non-actionable runs and reports a completed publication or a new failure. Pause it after all 25 entries are confirmed.
