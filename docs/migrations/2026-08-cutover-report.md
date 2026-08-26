# Cutover report: `added_at` backfill

Step 1a of the Confirmation Ledger requires `added_at` on every dataset row (docs/adr/0003). The rows below carried none and were backfilled. The date used is the earlier of two facts the repository can attest to: the first commit that added the file (`73afb99`, authored 2026-08-25T15:13:18-07:00, the only commit that has ever touched these files) and the row's own typed `last_verified_at`, since a row cannot have been verified before it existed. Neither is a claim about when the code or entry was released; it is the earliest date this repository knew of the row.

Nothing else on these rows changed. Their typed `status`, `last_verified_at` and `confidence` are their as-published baseline and stay as they were (docs/adr/0004).

## src/data/guides/steal-a-brainrot-all-brainrots.json (155 rows)

- Noobini Pizzanini (2026-08-25T00:00:00Z)
- Lirilì Larilà (2026-08-25T00:00:00Z)
- Tim Cheese (2026-08-25T00:00:00Z)
- Fluriflura (2026-08-25T00:00:00Z)
- Talpa Di Fero (2026-08-25T00:00:00Z)
- Svinina Bombardino (2026-08-25T00:00:00Z)
- Noobini Santanini (2026-08-25T00:00:00Z)
- Raccooni Jandelini (2026-08-25T00:00:00Z)
- Tartaragno (2026-08-25T00:00:00Z)
- Pipi Kiwi (2026-08-25T00:00:00Z)
- Pipi Corni (2026-08-25T00:00:00Z)
- Holy Arepa (2026-08-25T00:00:00Z)
- Trippi Troppi (2026-08-25T00:00:00Z)
- Gangster Footera (2026-08-25T00:00:00Z)
- Bandito Bobritto (2026-08-25T00:00:00Z)
- Boneca Ambalabu (2026-08-25T00:00:00Z)
- Cacto Hipopotamo (2026-08-25T00:00:00Z)
- Ta Ta Ta Ta Sahur (2026-08-25T00:00:00Z)
- Cupcake Koala (2026-08-25T00:00:00Z)
- Tric Trac Baraboom (2026-08-25T00:00:00Z)
- Frogo Elfo (2026-08-25T00:00:00Z)
- Pipi Avocado (2026-08-25T00:00:00Z)
- Pengolino Nuvoletto (2026-08-25T00:00:00Z)
- Pinealotto Fruttarino (2026-08-25T00:00:00Z)
- Cappuccino Assassino (2026-08-25T00:00:00Z)
- Brr Brr Patapim (2026-08-25T00:00:00Z)
- Avocadini Antilopini (2026-08-25T00:00:00Z)
- Trulimero Trulicina (2026-08-25T00:00:00Z)
- Bambini Crostini (2026-08-25T00:00:00Z)
- Malame Amarele (2026-08-25T00:00:00Z)
- Bananita Dolphinita (2026-08-25T00:00:00Z)
- Perochello Lemonchello (2026-08-25T00:00:00Z)
- Brri Brri Bicus Dicus Bombicus (2026-08-25T00:00:00Z)
- Avocadini Guffo (2026-08-25T00:00:00Z)
- Ti Ti Ti Sahur (2026-08-25T00:00:00Z)
- Mangolini Parrocini (2026-08-25T00:00:00Z)
- Frogato Pirato (2026-08-25T00:00:00Z)
- Salamino Penguino (2026-08-25T00:00:00Z)
- Gato Celesto (2026-08-25T00:00:00Z)
- Doi Doi Do (2026-08-25T00:00:00Z)
- Penguin Tree (2026-08-25T00:00:00Z)
- Wombo Rollo (2026-08-25T00:00:00Z)
- Penguino Cocosino (2026-08-25T00:00:00Z)
- Mummio Rappitto (2026-08-25T00:00:00Z)
- Burbaloni Loliloli (2026-08-25T00:00:00Z)
- Chimpanzini Bananini (2026-08-25T00:00:00Z)
- Ballerina Cappuccina (2026-08-25T00:00:00Z)
- Chef Crabracadabra (2026-08-25T00:00:00Z)
- Lionel Cactuseli (2026-08-25T00:00:00Z)
- Glorbo Fruttodrillo (2026-08-25T00:00:00Z)
- Quivioli Ameleonni (2026-08-25T00:00:00Z)
- Clickerino Crabo (2026-08-25T00:00:00Z)
- Blueberrinni Octopusini (2026-08-25T00:00:00Z)
- Caramello Filtrello (2026-08-25T00:00:00Z)
- Pipi Potato (2026-08-25T00:00:00Z)
- Strawberrelli Flamingelli (2026-08-25T00:00:00Z)
- Cocosini Mama (2026-08-25T00:00:00Z)
- Bandito Axolito (2026-08-25T00:00:00Z)
- Pandaccini Bananini (2026-08-25T00:00:00Z)
- Quackula (2026-08-25T00:00:00Z)
- Pi Pi Watermelon (2026-08-25T00:00:00Z)
- Buho del Cielo (2026-08-25T00:00:00Z)
- Sigma Boy (2026-08-25T00:00:00Z)
- Chocco Bunny (2026-08-25T00:00:00Z)
- Puffaball (2026-08-25T00:00:00Z)
- Sigma Girl (2026-08-25T00:00:00Z)
- Sealo Regalo (2026-08-25T00:00:00Z)
- Electro Quacko (2026-08-25T00:00:00Z)
- Buho de Fuego (2026-08-25T00:00:00Z)
- Seraphino Gruyero (2026-08-25T00:00:00Z)
- Frigo Camelo (2026-08-25T00:00:00Z)
- Orangutini Ananassini (2026-08-25T00:00:00Z)
- Rhino Toasterino (2026-08-25T00:00:00Z)
- Bombardiro Crocodilo (2026-08-25T00:00:00Z)
- Brutto Gialutto (2026-08-25T00:00:00Z)
- Spioniro Golubiro (2026-08-25T00:00:00Z)
- Bombombini Gusini (2026-08-25T00:00:00Z)
- Zibra Zubra Zibralini (2026-08-25T00:00:00Z)
- Tigrilini Watermelini (2026-08-25T00:00:00Z)
- Avocadorilla (2026-08-25T00:00:00Z)
- Cavallo Virtuoso (2026-08-25T00:00:00Z)
- Gorillo Subwoofero (2026-08-25T00:00:00Z)
- Gorillo Watermelondrillo (2026-08-25T00:00:00Z)
- Stoppo Luminino (2026-08-25T00:00:00Z)
- Tob Tobi Tobi (2026-08-25T00:00:00Z)
- Lerulerulerule (2026-08-25T00:00:00Z)
- Ganganzelli Trulala (2026-08-25T00:00:00Z)
- Te Te Te Sahur (2026-08-25T00:00:00Z)
- Rhino Helicopterino (2026-08-25T00:00:00Z)
- Magi Ribbitini (2026-08-25T00:00:00Z)
- Tracoducotulu Delapeladustuz (2026-08-25T00:00:00Z)
- Jingle Jingle Sahur (2026-08-25T00:00:00Z)
- Los Noobinis (2026-08-25T00:00:00Z)
- Cachorrito Melonito (2026-08-25T00:00:00Z)
- Spongini Quackini (2026-08-25T00:00:00Z)
- Carloo (2026-08-25T00:00:00Z)
- Bee Loco (2026-08-25T00:00:00Z)
- Harpuccino (2026-08-25T00:00:00Z)
- Carrotini Brainini (2026-08-25T00:00:00Z)
- Cocoteddy (2026-08-25T00:00:00Z)
- Centrucci Nuclucci (2026-08-25T00:00:00Z)
- Toiletto Focaccino (2026-08-25T00:00:00Z)
- Jacko Spaventosa (2026-08-25T00:00:00Z)
- Bananito Bandito (2026-08-25T00:00:00Z)
- Tree Tree Tree Sahur (2026-08-25T00:00:00Z)
- Fizzy Soda (2026-08-25T00:00:00Z)
- Berenjello Angello (2026-08-25T00:00:00Z)
- Bucketoro (2026-08-25T00:00:00Z)
- Orbi Mochi (2026-08-25T00:00:00Z)
- Tic Tic Ribbit (2026-08-25T00:00:00Z)
- Cocofanto Elefanto (2026-08-25T00:00:00Z)
- Girafa Celestre (2026-08-25T00:00:00Z)
- Gattatino Nyanino (2026-08-25T00:00:00Z)
- Gattatino Neonino (2026-08-25T00:00:00Z)
- Chihuanini Taconini (2026-08-25T00:00:00Z)
- Tralalero Tralala (2026-08-25T00:00:00Z)
- Matteo (2026-08-25T00:00:00Z)
- Los Crocodillitos (2026-08-25T00:00:00Z)
- Odin Din Din Dun (2026-08-25T00:00:00Z)
- Statutino Libertino (2026-08-25T00:00:00Z)
- Orcalero Orcala (2026-08-25T00:00:00Z)
- Piccione Macchina (2026-08-25T00:00:00Z)
- Bombardini Tortinii (2026-08-25T00:00:00Z)
- Beavo Potto (2026-08-25T00:00:00Z)
- Dumborino Miracello (2026-08-25T00:00:00Z)
- Tenini Ballini (2026-08-25T00:00:00Z)
- Pretzo Robo (2026-08-25T00:00:00Z)
- Jackorilla (2026-08-25T00:00:00Z)
- La Vacca Saturno Saturnita (2026-08-25T00:00:00Z)
- Blackhole Goat (2026-08-25T00:00:00Z)
- Extinct Tralalero (2026-08-25T00:00:00Z)
- Los Tralaleritos (2026-08-25T00:00:00Z)
- Honey Honey Narwhal (2026-08-25T00:00:00Z)
- Graipuss Medussi (2026-08-25T00:00:00Z)
- Tung Tung Tung Sahur (2026-08-25T00:00:00Z)
- Rosatops Triceratino (2026-08-25T00:00:00Z)
- Chicleteira Bicicleteira (2026-08-25T00:00:00Z)
- Syrup Samurai (2026-08-25T00:00:00Z)
- La Grande Combinasion (2026-08-25T00:00:00Z)
- Nuclearo Dinossauro (2026-08-25T00:00:00Z)
- Los Combinasionas (2026-08-25T00:00:00Z)
- Motorino Bumbino (2026-08-25T00:00:00Z)
- La Extinct Grande (2026-08-25T00:00:00Z)
- Los Bros (2026-08-25T00:00:00Z)
- Esok Sekolah (2026-08-25T00:00:00Z)
- Garama and Madundung (2026-08-25T00:00:00Z)
- Pop Pop Petalini (2026-08-25T00:00:00Z)
- Orchidox (2026-08-25T00:00:00Z)
- Griffin (2026-08-25T00:00:00Z)
- Skibidi Toilet (2026-08-25T00:00:00Z)
- John Pork (2026-08-25T00:00:00Z)
- Headless Horseman (2026-08-25T00:00:00Z)
- Meowl (2026-08-25T00:00:00Z)
- Strawberry Elephant (2026-08-25T00:00:00Z)
- Spyder Elephant (2026-08-25T00:00:00Z)

## src/data/blog/steal-a-brainrot-codes.json (19 rows)

- (unique code supplied with the Boppin Bunny plush) (2026-08-25T00:00:00Z)
- SATURN (2026-08-25T00:00:00Z)
- ILOVEFOOD123 (2026-08-25T00:00:00Z)
- NEEDTHIS4CRAFT333 (2026-08-25T00:00:00Z)
- FREEOCTOBLOCK777 (2026-08-25T00:00:00Z)
- FREEOCTO555 (2026-08-25T00:00:00Z)
- FREEPREMIUMOCTO777 (2026-08-25T00:00:00Z)
- FREEOCTOBASE333W (2026-08-25T00:00:00Z)
- WAVERIDER4FREELOL (2026-08-25T00:00:00Z)
- FREE500DRAGS (2026-08-25T00:00:00Z)
- JOHNPORKDAPIGGY (2026-08-25T00:00:00Z)
- CODESAREREAL321 (2026-08-25T00:00:00Z)
- IMANEGG (2026-08-25T00:00:00Z)
- PIZZAISYUM (2026-08-25T00:00:00Z)
- MAYMEOWLJANDEL (2026-08-25T00:00:00Z)
- CANDY24SAMMY (2026-08-25T00:00:00Z)
- DIVINECURSED (2026-08-25T00:00:00Z)
- BRUNOISBETTER (2026-08-25T00:00:00Z)
- BLUESAMMY67 (2026-08-25T00:00:00Z)

## src/data/blog/roblox-promo-codes.json (6 rows)

- JURASSICWORLD (2026-08-25T08:00:00Z)
- TARGET2018 (2026-08-25T08:00:00Z)
- MOTHRAUNLEASHED (2026-08-25T08:00:00Z)
- BARNESNOBLEGAMEON19 (2026-08-25T08:00:00Z)
- GAMESTOPBATPACK2019 (2026-08-25T08:00:00Z)
- TARGETOWLPAL2019 (2026-08-25T08:00:00Z)


# Cutover report: the states, the timers and the gate

Second commit of Step 1a, 2026-08-26. The row-by-row proof is generated, not written:
`pnpm snapshot:states` was run before and after the change (the two JSON files beside this
report) and `pnpm report:cutover` joined them to the typed data and wrote
`2026-08-cutover-states.md`. It found no violation: every row moved only along the mapping
below and no page lost its index entry.

## What every row displays now

| Displayed before | Rows | Displayed after |
|---|---|---|
| Needs recheck (operational, timer had fired) | 66 | Listed · awaiting editor verification |
| Unconfirmed (operational, no event) | 25 | Listed · awaiting editor verification |
| Expired (operational, rejected at review) | 98 | Expired |
| Active (dataset, confirmed within the old window) | 115 | Active · as published |
| Unverified (dataset) | 152 | Listed · awaiting editor verification |
| Expired (dataset) | 145 | Expired |
| Removed (dataset) | 83 | Expired (the row keeps a `removed` baseline, still selectable by `status=removed` and counted by `{{removedCount}}` on the pages written to v1) |

Nothing is ★ Verified: no editor event exists yet. The 164 manual-review events in
`operations.json` are the importer's output and are read as the as-published baseline.
Index: 14 operational pages indexable before and after (the 14 `published` games, on the
bypass that Step 5 retires); 10 dataset pages indexed before and after; the sitemap is
identical at 64 URLs.

## The baseline is frozen, not computed from the clock

A dataset row's baseline is what it displayed on cutover day under the old rule (a typed
`active` row displayed Active only with `confidence: confirmed` and a `last_verified_at`
within 14 days). That rule is evaluated against the constant `CUTOVER_AT`
(2026-08-26T00:00:00Z) in `src/lib/dataset.ts`, never against the build clock: 115 rows carry
a `last_verified_at` of 2026-08-25 and would otherwise have demoted on 2026-09-08 at the
first build after that date. No state changes because time has passed. The single clock
input left anywhere is a link row's own `expires_at`.

## Settings migrated

`verificationWindowHours` is renamed `recheckTargetDays` on all 58 games in
`src/content/operations.json`: the 52 code games at 24 hours and the 6 daily-surface games at
6 hours all become 1 day. The field is a target for the editor queue and is read by no
state derivation. The settings events that record this change in the ledger are written
when the ledger file lands (Step 1b), by the editor running that cutover, with the note
"migrated from verificationWindowHours".

## Fields no longer read

`recheck_cadence` (page level) and `needs_human` (every row) were deleted from the ten
dataset files and both templates: nothing displayed either, and the ten typed cadence
sentences were schedule promises nobody performed. `{{recheckCadence}}` now renders the
derived sentence on every page. `status`, `confidence`, `last_verified_at` and `ended_at`
stay in the ten files as the as-published baseline. `src/data/games/*.json` are frozen
importer inputs and were not touched.

## Deleted

`STALE_AFTER_DAYS`, `resolveDisplayStatus`, `countRows`, the `stale` and `reported` entry
states, `isUsableState` (now `isLiveState`), `formatMedianAge`, the median-age and
checked-in-the-last-hour figures, the dead `verify` route kind, every `data-relative-time`
attribute, the three demotion tests, the two "published game needs a verification event"
validator clauses, and the event synthesis in `scripts/build-operational-content.mjs`
(which was not re-run).

## The index gate

`isIndexable` is content-only: `retired` hides, `published` still indexes (the bypass stays
until Step 5), and every other page indexes the moment it has one live entry.
`officialSourceUrl` and two `redeemSteps` left the gate and are printed by `pnpm check:data`
as queue warnings. Known inconsistency, kept on purpose: the validator still requires that
furniture on a `published` game, so a `planned` game can index on one live entry while
flipping it to `published` without the furniture fails the build.

## Copy

Every reader-facing sentence that described the timer model was rewritten; the before and
after of each is in `2026-08-cutover-copy-sweep.md`. `/how-we-verify/` was rewritten to
the four states, the baseline, the apex rule, hearts and corrections; its `#evidence-states`
anchor still lands on the states table.

## Deferred to Step 1b

`reviewLabel` and `reviewedAt` on the editorial articles (`src/data/articles/*.ts`,
`EditorialArticle.astro`, `RouteScreen.astro`): the vocabulary check reports them and does
not fail on them until that step moves them to the retired list. The typed `status`,
`confidence` and `last_verified_at` on dataset rows and the 164 manual-review events become
ledger sightings in Step 1b; until then they are read as the baseline described above.

## Reviewed and left as they are

Two findings from the adversarial review of this commit were recorded rather than fixed:

- The code-page FAQ ("How many <game> codes are listed right now?") exists only in the
  FAQPage JSON-LD and is not visible on the page. The pattern predates this commit; the
  answer text was corrected here. Whether to render it visibly or drop the node is a
  component decision for Step 1b, when the row markup is rebuilt.
- Four files (src/pages/index.astro, src/data/authors.ts, src/layouts/partials/Footer.astro,
  src/data/guides/grow-a-garden-recipes.json) carry CRLF endings on disk; .gitattributes
  stores every text file as LF, so the committed blobs are unaffected.
