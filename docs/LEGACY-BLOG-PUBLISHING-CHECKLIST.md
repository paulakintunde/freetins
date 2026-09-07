# Legacy blog publishing checklist

Scope: restore the 16 requested URLs as 15 blog articles and one coding redirect. This is the execution sequence, not a report of completed publication.

Planning is complete in [the strategy](LEGACY-BLOG-CONTENT-STRATEGY.md) and [the topic briefs](LEGACY-BLOG-ARTICLE-BRIEFS.md). Article production, image production, implementation, and deployment remain to be done.

Execution has started. See [the production record](LEGACY-BLOG-PRODUCTION-STATUS.md)
for completed work, validation, and the next action. Checkboxes below remain open
where actual posting or integration is still required.

## 1. Establish the shared article foundation

- [ ] Use "First published in 2016" for all fifteen articles, based on the user's corrected Jetpack findings. Store the evidence attribution and year-only precision without inventing a month or day.
- [ ] Support an actual content posting/modification date separately from product review events. Display "Updated [actual posting date]" when the revised article goes live.
- [x] Adapt the editorial type, resolver, renderer, and date consumers to this distinction. Preserve existing article behavior outside the batch.
- [ ] Keep exact `datePublished` metadata absent where only the year is known. Match the actual update date across visible text, `dateModified`, and sitemap `lastmod`.
- [ ] Use Route M, with Markdown bodies in `src/content/articles/` and objects registered through `src/data/articles/index.ts`. Set the editorial section to Blog while preserving legacy paths.

Completion: the article system can display the agreed dates and serve a blog article at a legacy root path without a duplicate `/blog/` copy.

## 2. Produce the first three articles

Start with Cowon Clock, Monstercat Visualizer, and VisBubble. They establish the writing, configuration-example, and image workflow for the rest of the Rainmeter group.

- [ ] Read the original creator pages, relevant release notes, and current dependency documentation.
- [ ] Write complete articles from the briefs, including direct answers, steps, useful examples, failure recovery, and contextual citations.
- [ ] Perform the feasible product tests and retain observations. State documentation-based limits where hands-on access is unavailable; never invent a test result.
- [ ] Capture actual product images or obtain usable creator assets with a recorded rights basis. Include descriptive alt text and instructional captions.
- [ ] Create any companion settings or examples as original work, with dependencies and reset instructions.
- [ ] Review the rendered desktop and mobile articles for legibility, navigation, image detail, and usable instructions.

Completion: three finished articles with real assets and source notes, ready to use as the production reference for the remaining batch.

## 3. Complete the remaining twelve articles

| Order | Articles | Main production requirement |
|---|---|---|
| A | AMD Ryzen, blue JARVIS, SHIELD, Kurugin | Resolve package identity and original sources; distinguish showcase recipes from installers |
| B | Coding, iOS on Windows | Build and test the small coding example; distinguish simulator builds from consumer app access |
| C | iPhone codes, AdBlock comparison | State platform and carrier limits; use exact original support sources and comparable test conditions |
| D | Craigslist alternatives, ambigrams | Compare concrete tasks and actual outputs; document geography, export terms, and limitations |
| E | JW Player, Blackmart | Document authorized media workflows and attributable app sources without unsupported download claims |

- [ ] Finish each article's prose, source notes, examples, metadata, images, and related links.
- [ ] Check for em dashes, the user's prohibited adjective, cliches, padding, unsupported dates, and unsupported testing claims.
- [ ] Explain source-access gaps directly. Do not turn an unavailable package into a claimed working download.
- [ ] Keep one coding article. The second coding URL is an alias, not another writing assignment.

Completion: all fifteen distinct articles are finished. An image placeholder, outline, or proposed test does not count as a delivered asset or result. Missing verification alone must not create a noindex or other visibility restriction.

## 4. Restore routing and discovery

- [ ] Follow the exact URL map in the briefs: fifteen original article URLs return 200.
- [ ] Remove the sixteen matching entries from `src/data/gone.ts` and their explicit GonePage route files as the replacement content is integrated. Keep unrelated retired routes intact.
- [ ] Add a one-hop 301 from `/coding-learn-computing-programming/` to `/what-is-coding-learn-computing-programming/` in `public/_redirects`.
- [ ] Register image assets through the existing article-image system and keep internal links pointed at canonical destinations.
- [ ] Ensure Blog discovers editorial entries by section, including root-level and `/tech-guides/` paths.
- [ ] Check sitemap partitioning so these articles appear exactly once and under the intended blog grouping.
- [ ] Update migration inventories, removal decisions, and affected route tests to match restoration.

Completion: old inbound links reach the relevant articles, Blog exposes them, and no old 410 handler shadows a replacement or redirect.

## 5. Validate the complete release

- [ ] Run `pnpm typecheck` and `pnpm build`. The current build script runs the guards and route checks; inspect all results and resolve failures.
- [ ] Add focused regression coverage for year-only publication, actual modification dates, restored routes, and the coding alias.
- [ ] Verify the fifteen article responses, coding redirect, self-referencing canonicals, title budgets, single JSON-LD graphs, and sitemap inclusion against the built site.
- [ ] Inspect representative narrow and wide layouts and every article's images. Check keyboard access for any interactive examples and enlarged images.
- [ ] Confirm that article pages remain static and do not introduce metered requests merely to display content.
- [ ] Review the release diff without reverting unrelated user changes. Prepare a deployable build and record the release checklist results.

Completion: the finished release is locally reviewable with passing applicable checks. Planning alone does not authorize a commit, push, or live deployment.

## 6. Publish and check production

- [ ] When live publication is authorized, use the project's established deployment workflow. Preserve the prior deployment as a recovery point.
- [ ] Set each revised article's update date to its actual go-live date. If publication slips, correct the date before publishing; do not leave a planned date presented as an actual event.
- [ ] Check production responses, redirect destinations, date labels, images, canonicals, Blog links, and sitemap entries after deployment.
- [ ] Record the deployment identifier and actual posting date. For a material failure, restore the prior deployment and fix the release rather than leaving broken routes live.
- [ ] Confirm the sitemap index is available for search engines. Use Search Console submission or inspection when authorized account access is available.

Completion: all sixteen legacy entry points have the intended production behavior and the fifteen revised articles are publicly accessible.

## 7. Measure and maintain

- [ ] Record available prelaunch search and Jetpack baselines, then compare relevant queries and pages after about 28 and 56 days.
- [ ] Review reader reports, broken source links, product changes, image issues, and example failures.
- [ ] Update substantive content when needed and use the actual date that revision is posted.

These are follow-up tasks, not scheduled automations. No recurring monitoring has been created.
