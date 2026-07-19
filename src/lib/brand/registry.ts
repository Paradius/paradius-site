/**
 * Brand registry — architectural index, case/step codes, catalog copy.
 * S8 phase: mono system voice + numbered registry language.
 */

export type RegistrySectionId =
  | 'conviction'
  | 'selection'
  | 'practice'
  | 'evidence'
  | 'registry';

export interface RegistrySection {
  id: RegistrySectionId;
  num: string;
  label: string;
  href: string;
}

/** Architectural index — maps to Philosophy / Selection / Expertise / Work / Talent. */
export const REGISTRY_SECTIONS: readonly RegistrySection[] = [
  { id: 'conviction', num: '01', label: 'CONVICTION', href: '/#philosophy' },
  { id: 'selection', num: '02', label: 'SELECTION', href: '/#selection' },
  { id: 'practice', num: '03', label: 'PRACTICE', href: '/#expertise' },
  { id: 'evidence', num: '04', label: 'EVIDENCE', href: '/work' },
  { id: 'registry', num: '05', label: 'REGISTRY', href: '/talent' },
] as const;

/** Formats an architectural eyebrow: `01 — CONVICTION`. */
export function formatRegistryEyebrow(num: string, label: string): string {
  return `${num} — ${label}`;
}

/** Case study code from 1-based index: `CS-001`. */
export function formatCaseCode(index: number): string {
  return `CS-${String(index).padStart(3, '0')}`;
}

/** Process step code: `STEP-01`. */
export function formatStepCode(step: number): string {
  return `STEP-${String(step).padStart(2, '0')}`;
}

/** Talent catalog filter status line. */
export function formatRegistryStatus(total: number, visible?: number): string {
  if (visible !== undefined && visible !== total) {
    return `Registry: ${visible} of ${total} active profiles`;
  }
  return `Registry: ${total} active profiles`;
}

/** Resolves the active registry section from the current URL path. */
export function resolveActiveSection(pathname: string): RegistrySectionId | null {
  if (pathname === '/talent' || pathname.startsWith('/talent/')) {
    return 'registry';
  }
  if (pathname === '/work' || pathname.startsWith('/work/')) {
    return 'evidence';
  }
  return null;
}
