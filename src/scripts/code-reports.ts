/**
 * Reader reports on code rows.
 *
 * A page view makes no request. The control is rendered by RouteScreen only when
 * `services.reports` is enabled in the operational data, so its presence is already
 * the answer to "is this configured" and there is nothing to discover at runtime.
 * The previous version asked the endpoint once per control on every page load — 38
 * requests on a large codes page, twice over under ClientRouter — to decide whether
 * to unhide a button. On the free plan that is the whole day's budget spent on
 * something no reader can see.
 *
 * So: this script talks to the server only when a reader clicks. On load it paints
 * what this browser already sent, from localStorage alone.
 *
 * Two rules keep the click honest:
 *
 * - What is painted is the verdict the server holds, not the one just clicked. They
 *   differ when this reader already reported this code today — from another device on
 *   the same address, or before clearing storage — and the earlier vote is the one on
 *   record. Painting the new one would show a reader a report that was never stored.
 * - An answer that cannot change is not asked twice. A spent write budget (429) and an
 *   unconfigured endpoint (503) both hold for the rest of the page's life, so the first
 *   one stops the page from sending again instead of letting an impatient reader spend
 *   ten Function invocations learning the same thing.
 *
 * Nothing here changes a code's published state. The endpoint records reports and an
 * editor derives the re-check ordering from them; the label on the row still comes
 * from the verification record.
 */

const ENDPOINT = '/api/code-report.json';
const STORAGE_KEY = 'ft_reported_codes';

/** One line for a paused store and a dead network: both may work on the next try. */
const FAILURE_LINE = 'Not recorded. Try again later.';

/**
 * The other line, for answers a retry cannot change: 503 (reports are not configured on
 * this deployment) and any other 4xx (this build does not publish that entry id, or the
 * request carried no address). It deliberately does not invite a second click, and the
 * thumbs it applies to stay disabled.
 */
const UNAVAILABLE_LINE = 'Not recorded. Reports are not available here.';

type Verdict = 'worked' | 'failed';

const isVerdict = (value: unknown): value is Verdict => value === 'worked' || value === 'failed';

/** How each verdict is read out. The status line is a live region: it is spoken, not just seen. */
const VERDICT_LABEL: Record<Verdict, string> = {
  worked: 'it worked',
  failed: 'it did not work',
};

const confirmation = (stored: Verdict, clicked: Verdict) =>
  stored === clicked
    ? `Recorded: ${VERDICT_LABEL[stored]}.`
    : `Your earlier report today stands: ${VERDICT_LABEL[stored]}.`;

/**
 * Four ways a click can end, because four different things are true afterwards:
 *
 * - `paused`   the write budget is spent. Page-wide, and gone at 00:00 UTC.
 * - `unavailable` the endpoint is not configured. Page-wide, and gone at the next deploy.
 * - `refused`  this id is not one the endpoint takes. This control only; the rest of
 *              the page is fine, and stopping it would be a lie about the other codes.
 * - `failed`   the request did not arrive, or the server broke. The next one may work.
 */
type SendOutcome =
  | { status: 'accepted'; verdict: Verdict }
  | { status: 'paused' }
  | { status: 'unavailable' }
  | { status: 'refused' }
  | { status: 'failed' };

/**
 * Set by the first answer that cannot change while this page is open. It is page-scoped
 * and not persisted: a reload asks once more, which costs one request, and what this
 * stops is the ten clicks on one page that would each learn the same thing. A paused
 * store accepts writes again at 00:00 UTC and not before.
 */
let stopped: { line: string; retryable: boolean } | null = null;

/** Local memory of what this browser already sent, so the UI stays honest on return visits. */
const readReported = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
};

const rememberReported = (entryId: string, verdict: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readReported(), [entryId]: verdict }));
  } catch {
    // Private modes can refuse storage; the server-side dedup still applies.
  }
};

const statusLine = (group: HTMLElement, text: string) => {
  const status = group.querySelector<HTMLElement>('[data-report-status]');
  if (status) status.textContent = text;
};

const OPTIONS = ['worked', 'failed'] as const;

const thumb = (group: HTMLElement, option: Verdict) =>
  group.querySelector<HTMLButtonElement>(`[data-report-verdict="${option}"]`);

/** Close a control without claiming a verdict: the answer said no report was taken. */
const disableThumbs = (group: HTMLElement) => {
  for (const option of OPTIONS) {
    const button = thumb(group, option);
    if (button) button.disabled = true;
  }
};

/**
 * Paint one reader's own verdict. There are no counts to paint: none are ever fetched.
 * `aria-pressed` is set on both thumbs so the recorded choice is part of the button's
 * name when a screen reader reaches it, rather than a colour and a disabled state.
 */
const markChosen = (group: HTMLElement, verdict: Verdict) => {
  for (const option of OPTIONS) {
    const button = thumb(group, option);
    if (!button) continue;
    button.dataset.reported = String(option === verdict);
    button.setAttribute('aria-pressed', String(option === verdict));
    button.disabled = true;
  }
};

const send = async (entryId: string, verdict: Verdict): Promise<SendOutcome> => {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: entryId, verdict }),
    });
    // 429 is the store's daily write budget, answered honestly rather than as an error.
    if (response.status === 429) return { status: 'paused' };
    // 503 is the whole endpoint: reports are not configured on this deployment.
    if (response.status === 503) return { status: 'unavailable' };
    // Any other 4xx is settled for this control: the id is not one this build publishes,
    // or the request carried no address. Clicking again buys the same answer.
    if (response.status >= 400 && response.status < 500) return { status: 'refused' };
    if (!response.ok) return { status: 'failed' };
    const body = await response.json() as { accepted?: boolean; verdict?: unknown };
    if (body?.accepted !== true) return { status: 'failed' };
    // The server sends back the verdict it holds, which on a repeat is the earlier one.
    return { status: 'accepted', verdict: isVerdict(body.verdict) ? body.verdict : verdict };
  } catch {
    return { status: 'failed' };
  }
};

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest<HTMLButtonElement>('[data-report-verdict]');
  const group = button?.closest<HTMLElement>('[data-code-report]');
  const entryId = group?.dataset.codeReport;
  if (!button || !group || !entryId || button.disabled) return;

  const verdict = button.dataset.reportVerdict;
  if (!isVerdict(verdict)) return;

  // Already answered once, page-wide. Repaint the same line and send nothing.
  if (stopped) {
    if (!stopped.retryable) disableThumbs(group);
    statusLine(group, stopped.line);
    return;
  }

  button.disabled = true;
  statusLine(group, '');

  void send(entryId, verdict).then((outcome) => {
    if (outcome.status === 'accepted') {
      rememberReported(entryId, outcome.verdict);
      markChosen(group, outcome.verdict);
      // Written into the live region rather than cleared: on success the only other
      // feedback is a colour and a disabled button, neither of which is announced.
      statusLine(group, confirmation(outcome.verdict, verdict));
      return;
    }

    if (outcome.status === 'failed' || outcome.status === 'paused') {
      // A paused store stops the page; a dropped request does not, because the next
      // one may well arrive. Both invite the retry, so both give the button back.
      if (outcome.status === 'paused') stopped = { line: FAILURE_LINE, retryable: true };
      button.disabled = false;
      statusLine(group, FAILURE_LINE);
      return;
    }

    // Settled. An unconfigured endpoint stops the page; a refused id stops this control
    // only, because the other codes on the page are still perfectly reportable.
    if (outcome.status === 'unavailable') stopped = { line: UNAVAILABLE_LINE, retryable: false };
    disableThumbs(group);
    statusLine(group, UNAVAILABLE_LINE);
  });
});

/**
 * Paint remembered verdicts. Runs once per page view: once at module evaluation, and
 * once per ClientRouter swap, which is why the guard is the body element rather than a
 * boolean — `astro:page-load` also fires on the initial load, and without this the
 * first view would run it twice.
 *
 * The status line is left empty here on purpose. It is a live region, and announcing a
 * report from a previous visit on every page load would speak over the page itself;
 * `aria-pressed` carries the same fact without interrupting anyone.
 */
let paintedBody: HTMLElement | null = null;

const paintRemembered = () => {
  if (paintedBody === document.body) return;
  paintedBody = document.body;

  const groups = document.querySelectorAll<HTMLElement>('[data-code-report]');
  if (groups.length === 0) return;

  const remembered = readReported();
  for (const group of groups) {
    const entryId = group.dataset.codeReport;
    const verdict = entryId ? remembered[entryId] : undefined;
    if (isVerdict(verdict)) markChosen(group, verdict);
  }
};

document.addEventListener('astro:page-load', paintRemembered);
paintRemembered();

export {};
