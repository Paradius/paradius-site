import { z } from 'zod';
import type { ZodType } from 'zod';
import { formatValidationError, recordIdentifier } from './errors';
import {
  anonymousProfileSchema,
  caseStudySchema,
  vocabularySchema,
  type AnonymousProfile,
  type CaseStudy,
  type Vocabulary,
} from './schemas';
import { assertProfilesUseVocabulary, setVocabulary } from './vocabulary';

function resolveApiBaseUrl(): string {
  const baseUrl = process.env.PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      '[paradius-site] PUBLIC_API_BASE_URL is not set. Export the Paradius Core API base URL (see .env.example) before building.',
    );
  }
  return baseUrl.replace(/\/$/, '');
}

async function fetchApiPayload(path: string): Promise<unknown> {
  const url = `${resolveApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[paradius-site] Failed to fetch ${url}: ${message}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `[paradius-site] API ${url} returned HTTP ${response.status} ${response.statusText}`,
    );
  }

  try {
    return (await response.json()) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[paradius-site] API ${url} returned invalid JSON: ${message}`,
    );
  }
}

const API_PAGE_SIZE = 100;
const API_MAX_PAGES = 50;

/**
 * Fetch every page of a paginated list endpoint and merge them into one envelope,
 * so the build never silently drops records beyond the API's default page size.
 */
async function fetchAllPages(path: string): Promise<unknown> {
  const items: unknown[] = [];
  let totalItems = 0;
  for (let page = 1; page <= API_MAX_PAGES; page++) {
    const separator = path.includes('?') ? '&' : '?';
    const raw = await fetchApiPayload(
      `${path}${separator}page=${page}&perPage=${API_PAGE_SIZE}`,
    );
    if (typeof raw !== 'object' || raw === null) {
      return raw;
    }
    const envelope = raw as { items?: unknown; totalItems?: unknown };
    if (
      !Array.isArray(envelope.items) ||
      typeof envelope.totalItems !== 'number'
    ) {
      return raw;
    }
    items.push(...envelope.items);
    totalItems = envelope.totalItems;
    if (envelope.items.length === 0 || items.length >= totalItems) {
      break;
    }
  }
  if (items.length < totalItems) {
    throw new Error(
      `[paradius-site] API ${path} reported ${totalItems} items but pagination returned ${items.length}`,
    );
  }
  return { items, page: 1, perPage: Math.max(items.length, 1), totalItems };
}

function validateEnvelope<T>(
  raw: unknown,
  resource: string,
  idField: string,
  itemSchema: ZodType<T>,
): T[] {
  const envelopeResult = z
    .object({
      items: z.array(z.unknown()),
      page: z.number().int().positive(),
      perPage: z.number().int().positive(),
      totalItems: z.number().int().nonnegative(),
    })
    .superRefine((data, ctx) => {
      if (data.items.length > data.perPage) {
        ctx.addIssue({
          code: 'custom',
          message: `items length (${data.items.length}) exceeds perPage (${data.perPage})`,
          path: ['items'],
        });
      }
      if (data.totalItems < data.items.length) {
        ctx.addIssue({
          code: 'custom',
          message: `totalItems (${data.totalItems}) is less than items length (${data.items.length})`,
          path: ['totalItems'],
        });
      }
    })
    .safeParse(raw);

  if (!envelopeResult.success) {
    throw new Error(
      formatValidationError(resource, 'response envelope', envelopeResult.error),
    );
  }

  return envelopeResult.data.items.map((item, index) => {
    const itemResult = itemSchema.safeParse(item);
    if (!itemResult.success) {
      throw new Error(
        formatValidationError(
          resource,
          recordIdentifier(item, index, idField),
          itemResult.error,
        ),
      );
    }
    return itemResult.data;
  });
}

let profilesCache: AnonymousProfile[] | undefined;
let casesCache: CaseStudy[] | undefined;
let vocabularyCache: Vocabulary | undefined;

/** Load and validate all public wire data. Called at build start; also usable directly. */
export async function loadPublicData(): Promise<{
  vocabulary: Vocabulary;
  profiles: AnonymousProfile[];
  cases: CaseStudy[];
}> {
  const vocabulary = await getVocabulary();
  const [profiles, cases] = await Promise.all([getProfiles(), getCases()]);
  return { vocabulary, profiles, cases };
}

/** Role, seniority and availability values with their display labels, in Core's display order. */
export async function getVocabulary(): Promise<Vocabulary> {
  if (vocabularyCache) {
    return vocabularyCache;
  }

  const raw = await fetchApiPayload('/v1/public/vocabulary');
  const result = vocabularySchema.safeParse(raw);
  if (!result.success) {
    throw new Error(formatValidationError('vocabulary', 'response', result.error));
  }
  vocabularyCache = result.data;
  setVocabulary(vocabularyCache);
  return vocabularyCache;
}

/** Published anonymous profiles for catalog and detail pages (S3+). */
export async function getProfiles(): Promise<AnonymousProfile[]> {
  if (profilesCache) {
    return profilesCache;
  }

  const vocabulary = await getVocabulary();
  const raw = await fetchAllPages('/v1/public/profiles');
  const profiles = validateEnvelope(raw, 'profile', 'code', anonymousProfileSchema);
  assertProfilesUseVocabulary(profiles, vocabulary);
  profilesCache = profiles;
  return profilesCache;
}

/** Published case studies for work pages (S4+). */
export async function getCases(): Promise<CaseStudy[]> {
  if (casesCache) {
    return casesCache;
  }

  const raw = await fetchAllPages('/v1/public/cases');
  const allCases = validateEnvelope(
    raw,
    'case study',
    'slug',
    caseStudySchema,
  );
  casesCache = allCases.filter((caseStudy) => caseStudy.published);
  return casesCache;
}

/** Reset in-memory caches (for tests or repeated validation in one process). */
export function resetDataCache(): void {
  profilesCache = undefined;
  casesCache = undefined;
  vocabularyCache = undefined;
  setVocabulary(undefined);
}
