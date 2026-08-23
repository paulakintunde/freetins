type ConsentState = Record<string, boolean>;

interface CheckerSnapshot {
  available: boolean;
  state: 'Live' | 'Degraded' | 'Outage';
  lastFullRun: string;
  pagesChecked: number;
  medianResponseMs: number;
  message: string;
}

interface FormResponse {
  ok: boolean;
  message: string;
  manageUrl?: string;
  redirectTo?: string;
}

declare global {
  interface Window {
    __freetinsController?: AbortController;
    __freetinsStatusCache?: { snapshot: CheckerSnapshot; fetchedAt: number };
  }
}

const COPY_RESET_MS = 1600;
const CONSENT_COOKIE = 'ft_consent=';
const controller = new AbortController();

window.__freetinsController?.abort();
window.__freetinsController = controller;

let drawerReturnFocus: HTMLElement | null = null;
let copiedButton: HTMLButtonElement | null = null;
let copyResetTimer: number | undefined;
let checkerStatusRequest: Promise<CheckerSnapshot | null> | undefined;

const asElement = (target: EventTarget | null) => target instanceof Element ? target : null;

const drawerElements = () => ({
  overlay: document.querySelector<HTMLElement>('[data-drawer-overlay]'),
  drawer: document.querySelector<HTMLElement>('#mobile-drawer'),
  openButton: document.querySelector<HTMLButtonElement>('[data-drawer-open]'),
  closeButton: document.querySelector<HTMLButtonElement>('[data-drawer-close]'),
});

const closeDrawer = (restoreFocus = true) => {
  const { overlay, openButton } = drawerElements();
  const wasOpen = overlay ? !overlay.hidden : false;

  if (overlay) {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
  }
  openButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');

  if (restoreFocus && wasOpen) drawerReturnFocus?.focus();
  drawerReturnFocus = null;
};

const openDrawer = () => {
  const { overlay, drawer, openButton, closeButton } = drawerElements();
  if (!overlay || !drawer || !openButton || !closeButton) return;

  drawerReturnFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : openButton;
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  openButton.setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
  requestAnimationFrame(() => closeButton.focus());
};

const focusableDrawerElements = () => {
  const { drawer } = drawerElements();
  if (!drawer) return [];

  return Array.from(
    drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hidden);
};

const consentElements = () => {
  const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
  return {
    banner,
    managePanel: banner?.querySelector<HTMLElement>('[data-consent-manage]') ?? null,
    manageButton: banner?.querySelector<HTMLButtonElement>('[data-consent-toggle]') ?? null,
    acceptButton: banner?.querySelector<HTMLButtonElement>('[data-consent-accept]') ?? null,
    purposeButtons: Array.from(
      banner?.querySelectorAll<HTMLButtonElement>('[data-purpose]') ?? [],
    ),
  };
};

const readConsentCookie = (): ConsentState | null => {
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(CONSENT_COOKIE));
  if (!entry) return null;

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(entry.slice(CONSENT_COOKIE.length)));
    return parsed && typeof parsed === 'object' ? parsed as ConsentState : null;
  } catch {
    return null;
  }
};

const setConsentButtonState = (button: HTMLButtonElement, enabled: boolean) => {
  if (button.disabled) return;
  button.dataset.enabled = String(enabled);
  button.setAttribute('aria-checked', String(enabled));
  button.classList.toggle('enabled', enabled);
  const state = button.querySelector<HTMLElement>('[data-state]');
  if (state) state.textContent = enabled ? 'On' : 'Off';
};

const currentConsentChoices = () => {
  const state: ConsentState = {};
  consentElements().purposeButtons.forEach((button) => {
    const purpose = button.dataset.purpose;
    if (purpose) state[purpose] = button.disabled || button.dataset.enabled === 'true';
  });
  return state;
};

const saveConsentChoices = (state: ConsentState) => {
  const { banner } = consentElements();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}${encodeURIComponent(JSON.stringify(state))}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  if (banner) banner.hidden = true;
  window.dispatchEvent(new CustomEvent('freetins:consent-change', { detail: state }));
};

const openConsentManager = () => {
  const { banner, managePanel, manageButton, acceptButton } = consentElements();
  if (!banner || !managePanel || !manageButton || !acceptButton) return;

  banner.hidden = false;
  managePanel.hidden = false;
  manageButton.textContent = 'Close choices';
  if (banner.dataset.consentMode === 'gdpr') acceptButton.textContent = 'Save choices';
  requestAnimationFrame(() => {
    managePanel.querySelector<HTMLElement>('button:not([disabled])')?.focus();
  });
};

const syncConsent = () => {
  const { banner, purposeButtons } = consentElements();
  if (!banner) return;

  const savedState = readConsentCookie();
  if (!savedState) return;

  purposeButtons.forEach((button) => {
    const purpose = button.dataset.purpose;
    if (purpose && purpose in savedState) {
      setConsentButtonState(button, Boolean(savedState[purpose]));
    }
  });
  banner.hidden = true;
};

const isCheckerSnapshot = (value: unknown): value is CheckerSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CheckerSnapshot>;
  return typeof candidate.available === 'boolean'
    && ['Live', 'Degraded', 'Outage'].includes(candidate.state ?? '')
    && typeof candidate.lastFullRun === 'string'
    && typeof candidate.pagesChecked === 'number'
    && typeof candidate.medianResponseMs === 'number'
    && typeof candidate.message === 'string';
};

const renderCheckerStatus = (snapshot: CheckerSnapshot) => {
  const banner = document.querySelector<HTMLElement>('[data-outage-banner]');
  if (!banner) return;

  if (!snapshot.available || snapshot.state === 'Live') {
    banner.hidden = true;
    banner.dataset.statusState = snapshot.state;
    return;
  }

  const fingerprint = `${snapshot.state}:${snapshot.lastFullRun}`;
  const title = banner.querySelector<HTMLElement>('[data-status-title]');
  const message = banner.querySelector<HTMLElement>('[data-status-message]');
  banner.classList.toggle('degraded', snapshot.state === 'Degraded');
  banner.classList.toggle('outage', snapshot.state === 'Outage');
  banner.dataset.statusState = snapshot.state;
  banner.dataset.statusFingerprint = fingerprint;
  if (title) {
    title.textContent = snapshot.state === 'Outage'
      ? 'Hourly checks are currently unavailable'
      : 'Checks are running behind';
  }
  if (message) message.textContent = snapshot.message;

  try {
    banner.hidden = sessionStorage.getItem('ft_status_dismissed') === fingerprint;
  } catch {
    banner.hidden = false;
  }
};

const syncCheckerStatus = async () => {
  const cached = window.__freetinsStatusCache;
  if (cached && Date.now() - cached.fetchedAt < 30_000) {
    renderCheckerStatus(cached.snapshot);
    return;
  }

  const request = checkerStatusRequest ?? (async () => {
    try {
      const response = await fetch('/api/status', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const snapshot: unknown = await response.json();
      return isCheckerSnapshot(snapshot) ? snapshot : null;
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        // Keep the server-rendered state when the live status request cannot complete.
      }
      return null;
    }
  })();
  checkerStatusRequest = request;

  try {
    const snapshot = await request;
    if (!snapshot) return;
    window.__freetinsStatusCache = { snapshot, fetchedAt: Date.now() };
    renderCheckerStatus(snapshot);
  } finally {
    if (checkerStatusRequest === request) checkerStatusRequest = undefined;
  }
};

const dismissOutageBanner = () => {
  const banner = document.querySelector<HTMLElement>('[data-outage-banner]');
  if (banner) banner.hidden = true;
  try {
    sessionStorage.setItem(
      'ft_status_dismissed',
      banner?.dataset.statusFingerprint ?? banner?.dataset.statusState ?? 'dismissed',
    );
  } catch {
    // Session storage can be unavailable in hardened privacy modes.
  }
};

const writeClipboard = async (text: string) => {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.className = 'visually-hidden';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Clipboard copy was rejected');
};

const resetCopiedButton = () => {
  if (copyResetTimer !== undefined) window.clearTimeout(copyResetTimer);
  if (copiedButton?.isConnected) copiedButton.textContent = 'Copy';
  copiedButton = null;
  copyResetTimer = undefined;
};

const copyCode = async (button: HTMLButtonElement) => {
  resetCopiedButton();
  copiedButton = button;
  const code = button.dataset.copyCode ?? '';
  const liveRegion = document.querySelector<HTMLElement>('[data-copy-live]');

  try {
    await writeClipboard(code);
    if (copiedButton !== button || !button.isConnected) return;
    button.textContent = 'Copied';
    if (liveRegion) liveRegion.textContent = `${code} copied to clipboard.`;
    copyResetTimer = window.setTimeout(resetCopiedButton, COPY_RESET_MS);
  } catch {
    if (copiedButton !== button || !button.isConnected) return;
    button.textContent = 'Select code';
    if (liveRegion) liveRegion.textContent = `Could not copy ${code}. Select the code manually.`;
  }
};

const setFormStatus = (
  form: HTMLFormElement,
  state: 'pending' | 'success' | 'error',
  message: string,
  manageUrl?: string,
) => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) return;
  status.hidden = false;
  status.dataset.state = state;
  status.replaceChildren(document.createTextNode(message));
  if (manageUrl) {
    status.appendChild(document.createTextNode(' '));
    const link = document.createElement('a');
    link.href = manageUrl;
    link.textContent = 'Manage this alert';
    status.appendChild(link);
  }
};

const submitAsyncForm = async (form: HTMLFormElement, submitter: HTMLElement | null) => {
  const confirmation = submitter?.getAttribute('data-confirm');
  if (confirmation && !window.confirm(confirmation)) return;

  const controls = Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit"]'));
  const data = new FormData(form);
  if (submitter instanceof HTMLButtonElement && submitter.name) {
    data.set(submitter.name, submitter.value);
  }

  form.setAttribute('aria-busy', 'true');
  controls.forEach((button) => { button.disabled = true; });
  setFormStatus(form, 'pending', 'Sending...');

  try {
    const response = await fetch(form.action, {
      method: form.method || 'post',
      body: data,
      headers: {
        Accept: 'application/json',
        'X-Freetins-Request': 'form',
      },
      signal: controller.signal,
    });
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object') throw new Error('Invalid form response');
    const result = payload as FormResponse;
    if (!response.ok || !result.ok) {
      setFormStatus(form, 'error', result.message || 'The request could not be completed.');
      return;
    }
    if (result.redirectTo) {
      window.location.assign(result.redirectTo);
      return;
    }
    if (!form.hasAttribute('data-preserve-form')) form.reset();
    setFormStatus(form, 'success', result.message, result.manageUrl);
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      setFormStatus(form, 'error', 'The request could not be completed. Check your connection and try again.');
    }
  } finally {
    form.removeAttribute('aria-busy');
    controls.forEach((button) => { button.disabled = false; });
  }
};

const syncFormQueryState = () => {
  const url = new URL(window.location.href);
  const topic = url.searchParams.get('topic');
  // Worker ambient types share this project with browser code, so bridge this DOM-only query explicitly.
  const topicSelect = document.querySelector('[data-topic-select]') as unknown as HTMLSelectElement | null;
  if (topicSelect && topic) {
    const option = Array.from(topicSelect.options).find(
      (candidate) => candidate.value.toLowerCase() === topic.toLowerCase(),
    );
    if (option) topicSelect.value = option.value;
  }

  const state = url.searchParams.get('form');
  const message = url.searchParams.get('message');
  const form = document.querySelector<HTMLFormElement>('[data-async-form]');
  if (form && message && (state === 'success' || state === 'error')) {
    setFormStatus(form, state, message);
  }
};

const filterGameChoices = (input: HTMLInputElement) => {
  const container = input.closest('fieldset')?.querySelector<HTMLElement>('[data-game-choices]');
  if (!container) return;
  const query = input.value.trim().toLowerCase();
  container.querySelectorAll<HTMLElement>('[data-game-choice]').forEach((choice) => {
    choice.hidden = Boolean(query) && !(choice.dataset.searchName ?? '').includes(query);
  });
};

const syncPageState = () => {
  closeDrawer(false);
  syncConsent();
  void syncCheckerStatus();
  syncFormQueryState();
};

document.addEventListener('submit', (event) => {
  const form = event.target instanceof HTMLFormElement ? event.target : null;
  if (!form?.matches('[data-async-form]')) return;
  event.preventDefault();
  void submitAsyncForm(form, event.submitter instanceof HTMLElement ? event.submitter : null);
}, { signal: controller.signal });

document.addEventListener('input', (event) => {
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  if (input?.matches('[data-game-filter]')) filterGameChoices(input);
}, { signal: controller.signal });

document.addEventListener('click', (event) => {
  const target = asElement(event.target);
  if (!target) return;

  if (target.closest('[data-drawer-open]')) {
    openDrawer();
    return;
  }
  if (target.closest('[data-drawer-close]')) {
    closeDrawer();
    return;
  }
  if (target.closest('[data-drawer-link]')) {
    closeDrawer(false);
    return;
  }
  if (target.closest('[data-open-consent]')) {
    openConsentManager();
    return;
  }

  const purposeButton = target.closest<HTMLButtonElement>('[data-purpose]');
  if (purposeButton) {
    setConsentButtonState(purposeButton, purposeButton.dataset.enabled !== 'true');
    return;
  }

  const manageButton = target.closest<HTMLButtonElement>('[data-consent-toggle]');
  if (manageButton) {
    const { banner, managePanel, acceptButton } = consentElements();
    if (!banner || !managePanel || !acceptButton) return;
    const expanded = managePanel.hidden;
    managePanel.hidden = !expanded;
    manageButton.textContent = expanded ? 'Close choices' : 'Manage';
    if (banner.dataset.consentMode === 'gdpr') {
      acceptButton.textContent = expanded ? 'Save choices' : 'Accept all';
    }
    return;
  }

  if (target.closest('[data-consent-accept]')) {
    const { banner, managePanel, purposeButtons } = consentElements();
    if (!banner || !managePanel) return;
    if (managePanel.hidden && banner.dataset.consentMode === 'gdpr') {
      purposeButtons.forEach((button) => setConsentButtonState(button, true));
    }
    saveConsentChoices(currentConsentChoices());
    return;
  }

  if (target.closest('[data-consent-reject]')) {
    consentElements().purposeButtons.forEach((button) => setConsentButtonState(button, false));
    saveConsentChoices(currentConsentChoices());
    return;
  }
  if (target.closest('[data-outage-dismiss]')) {
    dismissOutageBanner();
    return;
  }
  const copyButton = target.closest<HTMLButtonElement>('[data-copy-code]');
  if (copyButton) void copyCode(copyButton);
}, { signal: controller.signal });

document.addEventListener('pointerdown', (event) => {
  const { overlay } = drawerElements();
  if (overlay && event.target === overlay) closeDrawer();
}, { signal: controller.signal });

document.addEventListener('keydown', (event) => {
  const { overlay } = drawerElements();
  if (!overlay || overlay.hidden) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeDrawer();
    return;
  }
  if (event.key !== 'Tab') return;

  const elements = focusableDrawerElements();
  const first = elements[0];
  const last = elements.at(-1);
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}, { signal: controller.signal });

document.addEventListener('astro:before-swap', () => {
  closeDrawer(false);
  resetCopiedButton();
}, { signal: controller.signal });

document.addEventListener('astro:page-load', syncPageState, { signal: controller.signal });
window.addEventListener('freetins:consent-open', openConsentManager, { signal: controller.signal });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncPageState, { once: true, signal: controller.signal });
} else {
  syncPageState();
}

export {};
