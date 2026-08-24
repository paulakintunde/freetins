import type { CheckerStatus } from '../layouts/partials/OutageBanner.astro';

export interface CheckerSnapshot {
  state: CheckerStatus;
  lastFullRun: string;
  pagesChecked: number;
  medianResponseMs: number;
  message: string;
}

interface CheckerStatusStore {
  get(key: string, type: 'json'): Promise<unknown>;
}

const unavailableSnapshot: CheckerSnapshot = {
  state: 'Unconfigured',
  lastFullRun: 'Unavailable',
  pagesChecked: 0,
  medianResponseMs: 0,
  message: 'Automated checker data is not configured. Published manual verification records remain visible.',
};

const isCheckerState = (value: unknown): value is CheckerStatus =>
  value === 'Unconfigured' || value === 'Live' || value === 'Degraded' || value === 'Outage';

const parseSnapshot = (value: unknown): CheckerSnapshot | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<CheckerSnapshot>;
  if (
    !isCheckerState(candidate.state)
    || typeof candidate.lastFullRun !== 'string'
    || typeof candidate.pagesChecked !== 'number'
    || typeof candidate.medianResponseMs !== 'number'
    || typeof candidate.message !== 'string'
  ) return null;

  return {
    state: candidate.state,
    lastFullRun: candidate.lastFullRun,
    pagesChecked: candidate.pagesChecked,
    medianResponseMs: candidate.medianResponseMs,
    message: candidate.message,
  };
};

export const readCheckerSnapshot = async (statusStore?: CheckerStatusStore) => {
  if (!statusStore) return unavailableSnapshot;

  try {
    const stored = await statusStore.get('checker:current', 'json');
    return parseSnapshot(stored) ?? unavailableSnapshot;
  } catch {
    return unavailableSnapshot;
  }
};
