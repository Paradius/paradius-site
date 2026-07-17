import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { ZodType } from 'zod';
import { formatValidationError, recordIdentifier } from './errors';
import {
  anonymousProfileSchema,
  caseStudySchema,
  type AnonymousProfile,
  type CaseStudy,
} from './schemas';

/** Fixture JSON lives under src/content/fixtures (cwd = project root at build/dev). */
const FIXTURES_DIR = join(process.cwd(), 'src/content/fixtures');

export type DataSource = 'api' | 'fixtures';

function resolveDataSource(): DataSource {
  const raw = process.env.DATA_SOURCE ?? 'fixtures';
  if (raw !== 'api' && raw !== 'fixtures') {
    throw new Error(
      `[paradius-site] Invalid DATA_SOURCE "${raw}". Expected "api" or "fixtures".`,
    );
  }
  return raw;
}

function resolveApiBaseUrl(): string {
  const baseUrl = process.env.PUBLIC_API_BASE_URL ?? 'https://api.paradius.dev';
  return baseUrl.replace(/\/$/, '');
}

function readFixtureFile(filename: string): unknown {
  const filePath = join(FIXTURES_DIR, filename);
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[paradius-site] Failed to read fixture "${filename}" at ${filePath}: ${message}`,
    );
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[paradius-site] Fixture "${filename}" is not valid JSON: ${message}`,
    );
  }
}

async function fetchApiPayload(path: string): Promise<unknown> {
  const url = `${resolveApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[paradius-site] Failed to fetch ${url} (DATA_SOURCE=api): ${message}`,
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

async function loadProfilesPayload(): Promise<unknown> {
  if (resolveDataSource() === 'fixtures') {
    return readFixtureFile('profiles.json');
  }
  return fetchApiPayload('/v1/public/profiles');
}

async function loadCasesPayload(): Promise<unknown> {
  if (resolveDataSource() === 'fixtures') {
    return readFixtureFile('cases.json');
  }
  return fetchApiPayload('/v1/public/cases');
}

let profilesCache: AnonymousProfile[] | undefined;
let casesCache: CaseStudy[] | undefined;

/** Load and validate all public wire data. Called at build start; also usable directly. */
export async function loadPublicData(): Promise<{
  profiles: AnonymousProfile[];
  cases: CaseStudy[];
}> {
  const [profiles, cases] = await Promise.all([getProfiles(), getCases()]);
  return { profiles, cases };
}

/** Published anonymous profiles for catalog and detail pages (S3+). */
export async function getProfiles(): Promise<AnonymousProfile[]> {
  if (profilesCache) {
    return profilesCache;
  }

  const raw = await loadProfilesPayload();
  profilesCache = validateEnvelope(
    raw,
    'profile',
    'code',
    anonymousProfileSchema,
  );
  return profilesCache;
}

/** Published case studies for work pages (S4+). */
export async function getCases(): Promise<CaseStudy[]> {
  if (casesCache) {
    return casesCache;
  }

  const raw = await loadCasesPayload();
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
}
