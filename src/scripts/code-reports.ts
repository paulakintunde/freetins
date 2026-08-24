/**
 * Reader reports on code rows.
 *
 * The controls ship hidden and are only revealed once the endpoint confirms it is
 * configured. A thumbs button that silently does nothing is worse than no button,
 * and the KV binding is optional, so the page must not assume it exists.
 *
 * Nothing here changes a code's published state. The endpoint counts reports and
 * flags lopsided ones for editorial re-check; the label on the row still comes from
 * the verification record.
 */

const ENDPOINT = '/api/code-report.json';
const STORAGE_KEY = 'ft_reported_codes';

interface ReportResponse {
  available?: boolean;
  worked?: number;
  failed?: number;
  counted?: boolean;
}

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

const paint = (group: HTMLElement, counts: ReportResponse, reported?: string) => {
  for (const verdict of ['worked', 'failed'] as const) {
    const button = group.querySelector<HTMLButtonElement>(`[data-report-verdict="${verdict}"]`);
    const count = group.querySelector<HTMLElement>(`[data-report-count="${verdict}"]`);
    if (count) count.textContent = String(counts[verdict] ?? 0);
    if (button) {
      button.dataset.reported = String(reported === verdict);
      button.disabled = Boolean(reported);
    }
  }
};

const send = async (entryId: string, verdict: string): Promise<ReportResponse | null> => {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: entryId, verdict }),
    });
    if (!response.ok) return null;
    return await response.json() as ReportResponse;
  } catch {
    return null;
  }
};

const load = async (entryId: string): Promise<ReportResponse | null> => {
  try {
    const response = await fetch(`${ENDPOINT}?entry=${encodeURIComponent(entryId)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json() as ReportResponse;
  } catch {
    return null;
  }
};

const sync = async () => {
  const groups = [...document.querySelectorAll<HTMLElement>('[data-code-report]')];
  if (groups.length === 0) return;

  const reported = readReported();
  const results = await Promise.all(groups.map((group) => load(group.dataset.codeReport ?? '')));

  let anyAvailable = false;
  groups.forEach((group, index) => {
    const result = results[index];
    if (!result?.available) return;
    anyAvailable = true;
    group.hidden = false;
    paint(group, result, reported[group.dataset.codeReport ?? '']);
  });

  const note = document.querySelector<HTMLElement>('[data-report-note]');
  if (note && anyAvailable) note.hidden = false;
};

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest<HTMLButtonElement>('[data-report-verdict]');
  const group = button?.closest<HTMLElement>('[data-code-report]');
  const entryId = group?.dataset.codeReport;
  if (!button || !group || !entryId || button.disabled) return;

  const verdict = button.dataset.reportVerdict ?? '';
  button.disabled = true;

  void send(entryId, verdict).then((result) => {
    if (!result?.available) {
      button.disabled = false;
      return;
    }
    rememberReported(entryId, verdict);
    paint(group, result, verdict);
  });
});

document.addEventListener('astro:page-load', () => void sync());
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void sync(), { once: true });
} else {
  void sync();
}

export {};
