import { describe, expect, it } from 'vitest';
import type { AnonymousProfile, Vocabulary } from './schemas';
import { assertProfilesUseVocabulary } from './vocabulary';

const vocabulary: Vocabulary = {
  roles: [{ value: 'mobile', label: 'Mobile' }, { value: 'backend', label: 'Backend' }],
  seniorities: [{ value: 'mid', label: 'Mid-level' }, { value: 'senior', label: 'Senior' }],
  availabilities: [{ value: 'available', label: 'Available now' }, { value: 'soon', label: 'Available soon' }],
};

function profile(overrides: Partial<AnonymousProfile>): AnonymousProfile {
  return {
    code: 'PA-0A0A0A',
    headline: 'Backend Engineer',
    seniority: 'senior',
    yearsExperience: 8,
    summary: 'Builds services.',
    availability: 'available',
    roles: ['backend'],
    stack: [],
    experience: [],
    languages: [],
    ...overrides,
  };
}

describe('assertProfilesUseVocabulary', () => {
  it('accepts profiles whose values are all in the vocabulary', () => {
    const profiles = [profile({}), profile({ code: 'PA-0B0B0B', roles: ['mobile', 'backend'], seniority: 'mid', availability: 'soon' })];

    expect(() => assertProfilesUseVocabulary(profiles, vocabulary)).not.toThrow();
  });

  it('names the profile code and the unknown role', () => {
    const profiles = [profile({}), profile({ code: 'PA-1C2D3E', roles: ['backend', 'ml'] })];

    expect(() => assertProfilesUseVocabulary(profiles, vocabulary)).toThrow(/Record: PA-1C2D3E[\s\S]*roles\.1: unknown value "ml"/);
  });

  it('names an unknown seniority', () => {
    const profiles = [profile({ seniority: 'principal' })];

    expect(() => assertProfilesUseVocabulary(profiles, vocabulary)).toThrow(/seniority: unknown value "principal"/);
  });

  it('names an unknown availability', () => {
    const profiles = [profile({ availability: 'paused' })];

    expect(() => assertProfilesUseVocabulary(profiles, vocabulary)).toThrow(/availability: unknown value "paused"/);
  });
});
