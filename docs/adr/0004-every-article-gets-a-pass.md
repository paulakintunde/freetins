# ADR 0004: Every article gets a pass

Status: accepted, 26 August 2026
Applies from: now, and through every step of the Confirmation Ledger plan
Amends: ADR 0003 (no hand-typed verification claims), whose rule governs new claims
from cutover forward and never reaches back to existing content
Related: the plan's index gate (Step 5), states (States and badges), and cutover

## Context

It takes real work to get an article. A system whose response to that work is to
reject it, park it in a corner, or hide it from search until someone has had time
to verify it destroys value it did not create. The Confirmation Ledger, in its first
drafts, did that in three places:

- The index gate was written as "live entry AND editor star", so a page full of
  content stayed out of the index until an editor reached it.
- The cutover relabelled existing rows downward — an Active dataset row became
  "Listed · not yet checked", an existing review line disappeared — and the plan's
  own audit found that would have de-indexed the fourteen published game pages
  unless a starring pass happened first.
- The check for typed verification fields failed the build, so a page carrying
  them was bounced rather than published.

The site's owner set the policy plainly: leave verification to the editor; do not
sweep content away or reject it; render it properly, with no noindex or other
blocking clause; before the ledger is built, always accept and add as awaiting
verification; and protect all current content, which keeps its current status
irrespective.

## Decision

**Verification is the editor's job and never a gate.**

1. **The landing state for anything unverified is "Listed · awaiting editor
   verification".** It is a state, not a rejection. The row renders in full —
   provenance, Copy, hearts where the page allows them, the report control — and
   the editor finds it in the queue, ordered by demand.

2. **No blocking clause is ever added for want of verification.** No `noindex`, no
   robots directive, no sitemap exclusion, no hidden row, no unpublished page. The
   index gate is content-only: a page with at least one live entry, and every
   dataset or editorial page, is indexed. Pin and hide events override it in either
   direction. Nothing a reader does, and nothing an editor has not yet done, opens or
   closes it. Empty placeholder pages stay out of the index because there is nothing
   on them — that is about emptiness, not verification — and a single entry brings
   them in.

3. **Existing content is protected, irrespective.** Every row and every article on
   the site keeps the status it displays on cutover day as its baseline. The
   cutover sighting for each row carries `asPublished: 'active' | 'unverified' |
   'expired'`; an Active dataset row stays "Active · as published", an Expired row
   stays Expired, an unconfirmed row becomes "Listed · awaiting editor verification"
   with no change in visibility, and an existing article's review line stays. The
   timers that would have demoted any of them are removed, so nothing decays. From
   there, only an editor event — a star, a review, a retirement — changes a state.
   The fourteen games indexed today through `publicationState: 'published'` are
   pinned at cutover, so the bypass can retire with nothing changing for them.

4. **Before the ledger exists, accept and add.** New content lands in whatever shape
   today's build accepts and is imported at cutover exactly like existing content,
   with the status it displays on cutover day as its baseline. After the ledger, new content lands as
   awaiting verification. In neither case does anything wait on a person.

5. **Typed verification claims on new content are ignored, never rejected.** The
   check that looks for them is advisory: it reports to the editor queue as "typed
   claims to confirm" and does not fail the build. ADR 0003's rule stands for what
   the site *displays* as a claim; it is not a reason to bounce a page.

6. **The first editor pass is valuable, not required.** Stars make the competitive
   claim true; indexing never waits on them.

## A boundary, stated

This policy governs verification. The format checks the build already runs on
dataset prose — the Answer Block length, the disambiguation line, the dash and date
rules, the link rules — are unchanged by it. Whether those should also become
advisory is a separate decision; nothing here assumes it either way.

## Consequences

- The index gate in the plan's Step 5 becomes content-only; the dry-run that blocks
  on any unacknowledged loss stays, and cannot find one caused by verification.
- The plan's states gain one carried-over baseline, "Active · as published", never
  assigned to new content; `{{activeCount}}` counts it and the `status=active` table
  filter selects it.
- ADR 0003's seeding paragraph and CI-check paragraph are amended to match; the
  "Reported expired" cutover display it described is withdrawn — an expired row is
  simply Expired, as it is today.
- The article router accepts every commission; its blockers are technical (a slug
  collision, an unregistered source), never verification.
- Heart-inflation attacks lose their last conceivable payoff: the gate consults
  nothing but content.
