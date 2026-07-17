import type {
  AnonymousExperienceEntry,
  AnonymousProfile,
  Availability,
  Seniority,
  SpokenLanguage,
} from '../api';

const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  staff: 'Staff',
};

const AVAILABILITY_LABELS: Record<Availability, { label: string; modifier: string }> = {
  available: { label: 'Available now', modifier: 'mockup-badge--available' },
  soon: { label: 'Available soon', modifier: 'mockup-badge--soon' },
  unavailable: { label: 'Currently assigned', modifier: 'mockup-badge--unavailable' },
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Human-readable seniority label. */
export function formatSeniority(seniority: Seniority): string {
  return SENIORITY_LABELS[seniority];
}

/** Availability badge copy and CSS modifier. */
export function formatAvailability(availability: Availability): {
  label: string;
  modifier: string;
} {
  return AVAILABILITY_LABELS[availability];
}

/** Stack slug → display label (e.g. `ci-cd` → `ci cd`). */
export function formatStackTag(tag: string): string {
  return tag.replace(/-/g, ' ');
}

/** Spoken language with CEFR level. */
export function formatLanguage(language: SpokenLanguage): string {
  const name = LANGUAGE_NAMES[language.lang] ?? language.lang.toUpperCase();
  return `${name} (${language.level})`;
}

/** ISO date (`YYYY-MM`) → `Mon YYYY`. */
export function formatExperienceDate(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const monthIndex = Number.parseInt(month, 10) - 1;
  return `${MONTH_LABELS[monthIndex] ?? month} ${year}`;
}

/** Experience entry date range. */
export function formatExperienceRange(entry: AnonymousExperienceEntry): string {
  const start = formatExperienceDate(entry.startDate);
  const end = entry.endDate ? formatExperienceDate(entry.endDate) : 'Present';
  return `${start} — ${end}`;
}

/** Top N stack tags for compact displays. */
export function topStackTags(profile: AnonymousProfile, limit = 4): string[] {
  return profile.stack.slice(0, limit);
}

/** Remaining stack count beyond the visible slice. */
export function overflowStackCount(profile: AnonymousProfile, limit = 4): number {
  return Math.max(0, profile.stack.length - limit);
}
