type ConsentState = Record<string, boolean>;

declare global {
  interface Window {
    __freetinsController?: AbortController;
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

const syncCheckerStatus = async () => {
  const banner = document.querySelector<HTMLElement>('[data-checker-status-url]');
  const url = banner?.dataset.checkerStatusUrl;
  if (!banner || !url) return;

  try {
    const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const snapshot = await response.json() as { state?: string; message?: string };
    if (!['Unconfigured', 'Live', 'Degraded', 'Outage'].includes(snapshot.state ?? '')) return;
    const state = snapshot.state ?? 'Unconfigured';
    const title = banner.querySelector<HTMLElement>('[data-checker-title]');
    const message = banner.querySelector<HTMLElement>('[data-checker-message]');
    const titles: Record<string, string> = {
      Unconfigured: 'Automated checking is not active',
      Live: 'Automated checks are live',
      Degraded: 'Checks are running behind',
      Outage: 'Automated checks are unavailable',
    };
    banner.className = `outage-banner ${state.toLowerCase()}`;
    banner.hidden = state === 'Live';
    if (title) title.textContent = titles[state] ?? titles.Unconfigured ?? 'Automated checking is not active';
    if (message && snapshot.message) message.textContent = snapshot.message;
  } catch {
    // Keep the server-rendered fallback when the status endpoint cannot be reached.
  }
};

const syncOutageBanner = () => {
  const banner = document.querySelector<HTMLElement>('[data-outage-banner]');
  if (!banner) return;

  try {
    banner.hidden = sessionStorage.getItem('ft_status_dismissed') === 'true';
  } catch {
    banner.hidden = false;
  }
};

const dismissOutageBanner = () => {
  const banner = document.querySelector<HTMLElement>('[data-outage-banner]');
  if (banner) banner.hidden = true;
  try {
    sessionStorage.setItem('ft_status_dismissed', 'true');
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
  document.body.append(textarea);
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

const syncPageState = async () => {
  closeDrawer(false);
  syncConsent();
  await syncCheckerStatus();
  syncOutageBanner();
};

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
      acceptButton.textContent = expanded
        ? 'Save choices'
        : banner.dataset.consentOptional === 'true' ? 'Accept all' : 'Continue';
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
