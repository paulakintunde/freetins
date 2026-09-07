# Legacy blog production record

Work recorded: 2026-09-06. Publication preparation is running on
`codex/legacy-blog-restoration`; production status is recorded below.

## Stage 1: date foundation implemented

The editorial model now supports a year-only publication fact, evidence notes, and
an actual revised posting date. The renderer displays "First published in 2016"
when that year is supplied. It omits an exact publication timestamp when the month
and day are unknown. An explicit posting date supplies the Updated label and
modification metadata independently of product reviews. RSS uses the revised
posting date when present and does not turn a historical year into January 1.

Existing articles keep their existing date display and metadata fallback. No
posting dates have been assigned to the new drafts. Sitemap dates are read from
the emitted page metadata by the existing build.

Validation completed: focused date tests passed; full `pnpm build` passed with
telemetry disabled, including guards, tests, content checks, and route validation.
The route crawl reported 132 documents, 7,554 internal links, and 128 sitemap
entries. Existing rendered pages remained static. A subsequent `pnpm build:only`
also passed with all three draft bodies included in the content collection. The
three drafts pass the em-dash and prohibited-word checks.

## Stage 2: all fifteen legacy articles integrated

| Article | Body | State |
|---|---|---|
| Cowon Clock | `src/content/articles/cowon-clock-rainmeter.md` | Integrated at original URL; source unavailable and product image remains |
| Monstercat Visualizer | `src/content/articles/monstercat-visualizer-rainmeter.md` | Integrated at original URL; package inspected and product image remains |
| VisBubble | `src/content/articles/visbubble-rainmeter.md` | Integrated at original URL; creator reference checked and product image remains |
| AMD Ryzen Setup | `src/content/articles/amd-ryzen-rainmeter-setup.md` | Integrated at original URL; current package and product image remain |
| Blue JARVIS | `src/content/articles/jarvis-blue-rainmeter-theme.md` | Integrated as a credited composition; rights-cleared product image remains |
| JARVIS and SHIELD | `src/content/articles/jarvis-shield-rainmeter-interface.md` | Integrated as a multi-author composition; rights-cleared product image remains |
| Kurugin | `src/content/articles/kurugin-rainmeter.md` | Integrated at original URL; current package and product image remain |
| Blackmart Alpha | `src/content/articles/blackmart-alpha-sources-alternatives.md` | Integrated as a source assessment; publisher identity remains unresolved and instructional images remain |
| iOS on Windows | `src/content/articles/ios-on-windows-testing-options.md` | Integrated as a task-based testing guide; product captures remain |
| iPhone dial codes | `src/content/articles/iphone-dial-codes-carrier-limits.md` | Integrated with one carrier-documented informational example; redacted settings images remain |
| AdBlock versus Adblock Plus | `src/content/articles/adblock-vs-adblock-plus.md` | Integrated as a documentation-based comparison; matched browser tests and captures remain |
| Craigslist alternatives | `src/content/articles/craigslist-alternatives-by-task.md` | Integrated by task and region; dated sample searches and redacted images remain |
| Ambigram generators | `src/content/articles/ambigram-generators-readability.md` | Integrated with a readability method and licensing limits; licensed outputs and tests remain |
| JW Player video downloads | `src/content/articles/jw-player-authorized-video-downloads.md` | Integrated as an authorized viewer and publisher workflow; no protection bypass is provided |
| What is coding | `src/content/articles/coding-browser-click-counter.md` | Integrated with a runnable, automatically tested browser counter |

All seven Rainmeter bodies are registered in the editorial route catalogue with
`section: 'blog'`. Their original URLs now build as static, indexable articles and
their matching 410 handlers have been removed. The Blog index and Blog sitemap
discover all seven even though the legacy URLs are root-level. Each article
distinguishes suggested reader checks from observed package inspection. No
Windows/Rainmeter installation test or performance benchmark is claimed.

Blackmart Alpha and iOS on Windows are registered through
`src/data/articles/platform-restoration.ts`. Blackmart provides no unidentified APK
link and directs readers to attributable publishers, Android protections, and
removal steps. The iOS article separates responsive website checks, browser-hosted
simulator builds, Mac-hosted compilation, real-device testing, and consumer App
Store access. Neither article claims a hands-on product test.

The second group adds about 3,670 words across AMD Ryzen Setup, Blue JARVIS,
JARVIS and SHIELD, and Kurugin. JARVIS and SHIELD are described as credited
compositions rather than single-package downloads. AMD separates cosmetic branding
from machine-specific sensor data. Kurugin retains its creator reference without
asserting that a current package was inspected.

## Research and image record

| Source | Observation | Production use |
|---|---|---|
| Cowon creator page, marcarnal | Direct retrieval returned 404 | Historical source retained; no working-download assertion |
| Monstercat GitHub repository and release page | Documentation and 2.1.0 package accessible | Package entry point, inspected settings, and separate audio/metadata workflows |
| VisBubble creator page, undefinist | Description accessible | Settings locations, source-capture limitation, free/purchase distinction |
| AMD RYZEN SETUP, SolBlaze86 | Historical creator reference identified; package not inspected | Attribution and source-status guidance |
| Blue JARVIS, edreyes | Historical presentation identified | Composition model and creator reference |
| JARVIS and SHIELD screenshot, Ferozkhanhamid | Description lists edreyes, Daelnz, and separate component credits | Component map and attribution guidance |
| Kurugin, llego001 | Historical creator reference identified; package not inspected | Attribution and cautious restoration guidance |
| HWiNFO add-ons and plug-in documentation | Official integration listing accessible | Machine-specific sensor-ID guidance for AMD setup |

No matching existing image assets were found in the inspected public and WordPress
filenames. No third-party artwork has been copied without a reuse basis.

Required image sequence: Cowon desktop and date settings; Monstercat bars and output
settings; VisBubble circle and settings; AMD composition and sensor configuration;
JARVIS component map; SHIELD component map; Kurugin modules. Capture actual
installations or acquire creator material under suitable terms. Record creator,
source, rights, capture environment, caption, and alt text. Do not substitute a
generated product interface.

Validation after the second group: 14 focused tests passed; `pnpm build:only` passed
with telemetry disabled; the route crawl passed 139 static documents, 7,936 internal
links, and 135 sitemap entries. Each new rendered page has the correct canonical,
one JSON-LD graph, the year-only publication label, no fabricated `datePublished`,
and no 410 text.

Validation after Blackmart and iOS: 16 focused tests passed, including a regression
guard against adding an unidentified Blackmart download route. `pnpm build:only`
passed with telemetry disabled. The route crawl passed 141 static documents, 8,044
internal links, and 137 sitemap entries. Both rendered pages have the correct
canonical, one JSON-LD graph, the year-only publication label, no fabricated
`datePublished`, and no 410 text.

Validation after iPhone codes, ad blockers, Craigslist alternatives, and ambigrams:
the four bodies add about 4,020 words and pass the prohibited-language and draft-marker
scans. All 16 focused tests and `pnpm build:only` passed. The route crawl passed 145
static documents, 8,260 internal links, and 141 sitemap entries. Each rendered page
has the correct canonical, one JSON-LD graph, the year-only publication label, no
fabricated `datePublished`, and no 410 text.

Validation after JW Player and the coding project: all 213 repository tests passed,
including execution of the counter script and safeguards around authorized media
access. The full `pnpm build` pipeline passed. The route crawl checked 148 static
documents, 8,369 internal links, and 143 sitemap entries. Both canonical articles
render "First published in 2016" without an invented `datePublished` or
`dateModified`. The historical coding alias redirects to the canonical article in
one hop.

Publication image pass: all fifteen articles now have registered responsive WebP
artwork and 1200 by 630 social images. Fourteen are original, labeled instructional
diagrams generated by `scripts/generate-restoration-art.mjs`; the coding article uses
a real capture of the Freetins-owned counter. Rights and source details are recorded
in `docs/LEGACY-BLOG-IMAGE-RECORD.md`.

Final prepublication validation on 2026-09-06: all 213 tests and the full `pnpm build`
pipeline passed with the same 148-document, 8,369-link, and 143-sitemap-entry route
totals. Browser QA at 1280 pixels and 390 pixels found no horizontal overflow. In a
real browser, three Add one activations produced `3`, Reset produced `0`, and keyboard
activation produced `1`.

## Next action

The fifteen articles are assigned the 2026-09-06 posting date for the authorized
single-release deployment. The date model emits its Updated label and modification
metadata from this value.

All fifteen distinct legacy articles are integrated. The duplicate
`/coding-learn-computing-programming/` path redirects in one hop to the canonical
coding article. Product screenshots, rights records, and the planned product-specific
hands-on tests remain editorial production work where noted in the table above.
