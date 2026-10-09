import { formatFieldIssues, type FieldIssue } from './errors';
import type { AnonymousProfile, Vocabulary, VocabularyEntry } from './schemas';

let current: Vocabulary | undefined;

/** Makes the vocabulary readable synchronously by the formatters. */
export function setVocabulary(vocabulary: Vocabulary | undefined): void {
  current = vocabulary;
}

export function currentVocabulary(): Vocabulary | undefined {
  return current;
}

function unknownValue(
  entries: readonly VocabularyEntry[],
  value: string,
  path: readonly PropertyKey[],
): FieldIssue[] {
  return entries.some((entry) => entry.value === value)
    ? []
    : [{ path, message: `unknown value "${value}" (not in the Core vocabulary)` }];
}

/** Throws on the first profile that uses a role, seniority or availability Core does not list. */
export function assertProfilesUseVocabulary(
  profiles: readonly AnonymousProfile[],
  vocabulary: Vocabulary,
): void {
  for (const profile of profiles) {
    const issues = [
      ...profile.roles.flatMap((role, index) => unknownValue(vocabulary.roles, role, ['roles', index])),
      ...unknownValue(vocabulary.seniorities, profile.seniority, ['seniority']),
      ...unknownValue(vocabulary.availabilities, profile.availability, ['availability']),
    ];
    if (issues.length > 0) {
      throw new Error(formatFieldIssues('profile', profile.code, issues));
    }
  }
}
