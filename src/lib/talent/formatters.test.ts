import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AnonymousProfile } from '../api';
import { setVocabulary } from '../api/vocabulary';
import {
  collectRoles,
  formatAvailability,
  formatExperienceRange,
  formatExperienceYears,
  formatRole,
  formatSeniority,
  formatStackTag,
} from './formatters';

const open = { role: 'Senior Flutter Developer', startDate: '2021-04', industryDescriptor: 'fintech startup', achievements: [], stack: [] };
const closed = { ...open, startDate: '2018-02', endDate: '2021-03' };

describe('formatExperienceYears', () => {
  it('reads an open entry as start year to now', () => { expect(formatExperienceYears(open)).toBe('2021 to now'); });
  it('reads a closed entry as start year to end year', () => { expect(formatExperienceYears(closed)).toBe('2018 to 2021'); });
});

describe('formatExperienceRange', () => {
  it('keeps the month form with Present for an open entry', () => { expect(formatExperienceRange(open)).toBe('Apr 2021 to Present'); });
  it('keeps the month form for a closed entry', () => { expect(formatExperienceRange(closed)).toBe('Feb 2018 to Mar 2021'); });
});

describe('formatStackTag', () => {
  it('spells a known acronym', () => { expect(formatStackTag('ci-cd')).toBe('CI/CD'); });
  it('spells a known brand', () => { expect(formatStackTag('nextjs')).toBe('Next.js'); });
  it('capitalizes an unknown hyphenated tag', () => { expect(formatStackTag('some-thing')).toBe('Some thing'); });
});

describe('vocabulary formatters', () => {
  beforeEach(() => {
    setVocabulary({
      roles: [{ value: 'mobile', label: 'Mobile' }, { value: 'ml', label: 'Machine learning' }, { value: 'backend', label: 'Backend' }, { value: 'qa', label: 'QA' }],
      seniorities: [{ value: 'mid', label: 'Mid-level' }],
      availabilities: [{ value: 'soon', label: 'Available soon' }],
    });
  });

  afterEach(() => { setVocabulary(undefined); });

  it('labels a role from the vocabulary', () => { expect(formatRole('ml')).toBe('Machine learning'); });
  it('labels a seniority from the vocabulary', () => { expect(formatSeniority('mid')).toBe('Mid-level'); });
  it('labels an availability and keeps its badge modifier', () => {
    expect(formatAvailability('soon')).toEqual({ label: 'Available soon', modifier: 'badge--soon' });
  });

  it('capitalizes a role the vocabulary does not label', () => { expect(formatRole('platform')).toBe('Platform'); });
  it('capitalizes a seniority the vocabulary does not label', () => { expect(formatSeniority('principal')).toBe('Principal'); });
  it('capitalizes an availability the vocabulary does not label', () => {
    expect(formatAvailability('paused')).toEqual({ label: 'Paused', modifier: 'badge--paused' });
  });

  it('collects roles in vocabulary order, not alphabetical or by appearance', () => {
    const base = { headline: 'h', seniority: 'mid', yearsExperience: 1, summary: 's', availability: 'soon', stack: [], experience: [], languages: [] };
    const profiles: AnonymousProfile[] = [
      { ...base, code: 'PA-000001', roles: ['qa', 'backend'] },
      { ...base, code: 'PA-000002', roles: ['mobile', 'qa'] },
    ];

    expect(collectRoles(profiles)).toEqual(['mobile', 'backend', 'qa']);
  });
});
