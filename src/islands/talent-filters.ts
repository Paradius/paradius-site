/**
 * Client-side talent registry filters: progressive enhancement over static rows.
 * With JS disabled, all cards remain visible in the build-rendered HTML.
 */

import { formatRegistryStatus } from '../lib/brand/registry';

interface FilterState {
  role: string;
  seniority: string;
  availability: string;
  stack: string;
}

const PARAM_KEYS = ['role', 'seniority', 'availability', 'stack'] as const;

function readStateFromUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return {
    role: params.get('role') ?? '',
    seniority: params.get('seniority') ?? '',
    availability: params.get('availability') ?? '',
    stack: (params.get('stack') ?? '').trim().toLowerCase(),
  };
}

function writeStateToUrl(state: FilterState): void {
  const params = new URLSearchParams();
  for (const key of PARAM_KEYS) {
    const value = state[key];
    if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  const nextUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(null, '', nextUrl);
}

function matchesRow(row: HTMLElement, state: FilterState): boolean {
  if (state.role) {
    const roles = row.dataset.roles?.split(' ') ?? [];
    if (!roles.includes(state.role)) {
      return false;
    }
  }

  if (state.seniority && row.dataset.seniority !== state.seniority) {
    return false;
  }

  if (state.availability && row.dataset.availability !== state.availability) {
    return false;
  }

  if (state.stack) {
    const stack = row.dataset.stack ?? '';
    if (!stack.includes(state.stack)) {
      return false;
    }
  }

  return true;
}

function setActivePill(group: string, value: string): void {
  const pills = document.querySelectorAll<HTMLButtonElement>(
    `[data-filter="${group}"]`,
  );
  for (const pill of pills) {
    const isActive = pill.dataset.value === value;
    pill.setAttribute('aria-pressed', String(isActive));
  }
}

function applyFilters(
  rows: HTMLElement[],
  state: FilterState,
  statusEl: HTMLElement | null,
): void {
  let visible = 0;
  for (const row of rows) {
    const show = matchesRow(row, state);
    row.hidden = !show;
    if (show) {
      visible += 1;
    }
  }

  if (statusEl) {
    const total = rows.length;
    statusEl.textContent = formatRegistryStatus(total, visible);
  }
  const emptyEl = document.getElementById('talent-empty');
  if (emptyEl) emptyEl.hidden = visible > 0;
}

function initTalentFilters(): void {
  const root = document.getElementById('talent-filters');
  const catalog = document.getElementById('talent-catalog');
  if (!root || !catalog) {
    return;
  }

  const rows = [...catalog.querySelectorAll<HTMLElement>('[data-talent-row]')];
  const statusEl = document.getElementById('talent-filter-status');
  const stackInput = document.getElementById('talent-stack-search') as HTMLInputElement | null;

  let state = readStateFromUrl();

  setActivePill('role', state.role);
  setActivePill('seniority', state.seniority);
  setActivePill('availability', state.availability);
  if (stackInput) {
    stackInput.value = state.stack;
  }

  applyFilters(rows, state, statusEl);

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !target.dataset.filter) {
      return;
    }

    const group = target.dataset.filter as keyof FilterState;
    if (!PARAM_KEYS.includes(group)) {
      return;
    }

    state = { ...state, [group]: target.dataset.value ?? '' };
    setActivePill(group, state[group]);
    writeStateToUrl(state);
    applyFilters(rows, state, statusEl);
  });

  stackInput?.addEventListener('input', () => {
    state = { ...state, stack: stackInput.value.trim().toLowerCase() };
    writeStateToUrl(state);
    applyFilters(rows, state, statusEl);
  });
}

initTalentFilters();
