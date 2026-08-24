import { prepareRecords, searchRecords, type PreparedRecord, type SearchRecord } from '../lib/search';

const INDEX_URL = '/search-index.json';
const RESULT_LIMIT = 30;
const TYPING_DEBOUNCE_MS = 160;

interface SearchApp {
  root: HTMLElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  status: HTMLElement;
  results: HTMLElement;
}

let indexPromise: Promise<PreparedRecord[]> | null = null;
let indexReady = false;
let debounceTimer: number | undefined;
let renderToken = 0;

const loadIndex = () => {
  indexPromise ??= fetch(INDEX_URL, { headers: { Accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Search index responded ${response.status}`);
      const payload = await response.json() as { records?: SearchRecord[] };
      const prepared = prepareRecords(payload.records ?? []);
      indexReady = true;
      return prepared;
    })
    .catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
};

/**
 * Read from the live DOM on every event. The page is swapped by the view
 * transition router, so a cached element reference goes stale on navigation.
 */
const readApp = (): SearchApp | null => {
  const root = document.querySelector<HTMLElement>('[data-search-app]');
  const form = root?.querySelector<HTMLFormElement>('[data-search-form]');
  const input = root?.querySelector<HTMLInputElement>('[data-search-input]');
  const status = root?.querySelector<HTMLElement>('[data-search-status]');
  const results = root?.querySelector<HTMLElement>('[data-search-results]');
  if (!root || !form || !input || !status || !results) return null;
  return { root, form, input, status, results };
};

const queryFromLocation = () => new URLSearchParams(location.search).get('q') ?? '';

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const emptyState = (heading: string, body: string) => {
  const wrapper = element('div', 'data-empty');
  wrapper.append(element('strong', undefined, heading), element('p', undefined, body));
  return wrapper;
};

const resultCard = (record: SearchRecord) => {
  const link = element('a', 'search-result');
  link.href = record.path;
  link.append(
    element('span', 'search-result-group', record.group),
    element('strong', undefined, record.title),
    element('p', undefined, record.description),
    element('small', undefined, record.path),
  );
  return link;
};

const render = (app: SearchApp, query: string, records: PreparedRecord[] | null) => {
  const trimmed = query.trim();
  app.results.replaceChildren();

  if (trimmed.length === 0) {
    app.status.textContent = '';
    app.results.append(
      emptyState(
        'Type a game, guide or code',
        'Search covers every published code page, daily-link page, cheat sheet, answer sheet and guide on Freetins.',
      ),
    );
    return;
  }

  if (records === null) {
    app.status.textContent = '';
    app.results.append(
      emptyState(
        'Search is unavailable right now',
        'The search index could not be loaded. Use “All games A-Z” below to browse every published page instead.',
      ),
    );
    return;
  }

  const results = searchRecords(records, trimmed, { limit: RESULT_LIMIT });

  if (results.length === 0) {
    app.status.textContent = `No published page matches “${trimmed}”.`;
    app.results.append(
      emptyState(
        `Nothing published matches “${trimmed}”`,
        'Freetins only indexes pages with a source and a recorded check. Try a shorter query, or request the game so it enters validation.',
      ),
    );
    return;
  }

  app.status.textContent = `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${trimmed}”`;
  const list = element('div', 'search-results-list');
  for (const result of results) list.append(resultCard(result.record));
  app.results.append(list);
};

/** A render is stale once a newer one starts or its container leaves the document. */
const run = (app: SearchApp, query: string) => {
  const token = (renderToken += 1);
  const isCurrent = () => token === renderToken && app.root.isConnected;

  if (query.trim().length === 0) {
    render(app, query, []);
    return;
  }

  // Only shown on a cold index; a warm one renders synchronously below.
  if (!indexReady) {
    app.status.textContent = 'Searching…';
    app.results.replaceChildren(emptyState('Searching…', 'Loading the index of published pages.'));
  }

  void loadIndex().then(
    (records) => {
      if (isCurrent()) render(app, query, records);
    },
    () => {
      if (isCurrent()) render(app, query, null);
    },
  );
};

const updateLocation = (query: string, mode: 'push' | 'replace') => {
  const url = new URL(location.href);
  if (query.trim().length === 0) url.searchParams.delete('q');
  else url.searchParams.set('q', query);
  if (url.href === location.href) return;
  if (mode === 'push') history.pushState({}, '', url);
  else history.replaceState({}, '', url);
};

const sync = () => {
  window.clearTimeout(debounceTimer);
  const app = readApp();
  if (!app) return;

  const query = queryFromLocation();
  if (app.input.value !== query) app.input.value = query;
  run(app, query);
};

document.addEventListener('submit', (event) => {
  const app = readApp();
  if (!app || event.target !== app.form) return;

  event.preventDefault();
  window.clearTimeout(debounceTimer);
  updateLocation(app.input.value, 'push');
  run(app, app.input.value);
});

document.addEventListener('input', (event) => {
  const app = readApp();
  if (!app || event.target !== app.input) return;

  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    const current = readApp();
    if (!current) return;
    updateLocation(current.input.value, 'replace');
    run(current, current.input.value);
  }, TYPING_DEBOUNCE_MS);
});

// Warm the index as soon as the field is focused so the first submit renders instantly.
document.addEventListener('focusin', (event) => {
  const app = readApp();
  if (app && event.target === app.input) void loadIndex().catch(() => undefined);
});

document.addEventListener('astro:page-load', sync);
window.addEventListener('popstate', sync);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once: true });
else sync();

export {};
