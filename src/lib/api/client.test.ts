import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProfiles, getVocabulary, resetDataCache } from './client';

const BASE_URL = 'https://core.test';

const vocabularyPayload = {
  roles: [{ value: 'mobile', label: 'Mobile' }, { value: 'backend', label: 'Backend' }],
  seniorities: [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-level' },
    { value: 'senior', label: 'Senior' },
    { value: 'staff', label: 'Staff' },
  ],
  availabilities: [
    { value: 'available', label: 'Available now' },
    { value: 'soon', label: 'Available soon' },
    { value: 'unavailable', label: 'Currently assigned' },
  ],
};

const profileWire = {
  code: 'PA-1C2D3E',
  headline: 'Backend Engineer',
  seniority: 'senior',
  yearsExperience: 8,
  summary: 'Builds services.',
  availability: 'available',
  roles: ['backend', 'ml'],
};

function serve(routes: Record<string, unknown>) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname;
    if (!(path in routes)) {
      return new Response('Route not found', { status: 404, statusText: 'Not Found' });
    }
    return new Response(JSON.stringify(routes[path]), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  resetDataCache();
  vi.stubEnv('PUBLIC_API_BASE_URL', `${BASE_URL}/`);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('getVocabulary', () => {
  it('parses the three lists from Core keeping their order', async () => {
    const fetchMock = serve({ '/v1/public/vocabulary': vocabularyPayload });

    const vocabulary = await getVocabulary();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/v1/public/vocabulary`);
    expect(vocabulary.seniorities.map((entry) => entry.value)).toEqual(['junior', 'mid', 'senior', 'staff']);
    expect(vocabulary.availabilities[2]).toEqual({ value: 'unavailable', label: 'Currently assigned' });
  });

  it('fetches once and serves later calls from the cache', async () => {
    const fetchMock = serve({ '/v1/public/vocabulary': vocabularyPayload });

    await getVocabulary();
    await getVocabulary();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an entry with an empty label, naming its path', async () => {
    const broken = { ...vocabularyPayload, seniorities: [{ value: 'junior', label: 'Junior' }, { value: 'mid', label: '' }] };
    serve({ '/v1/public/vocabulary': broken });

    await expect(getVocabulary()).rejects.toThrow(/Invalid vocabulary data[\s\S]*seniorities\.1\.label/);
  });

  it('fails with a clear message when PUBLIC_API_BASE_URL is missing', async () => {
    vi.stubEnv('PUBLIC_API_BASE_URL', '');
    serve({ '/v1/public/vocabulary': vocabularyPayload });

    await expect(getVocabulary()).rejects.toThrow(/PUBLIC_API_BASE_URL is not set/);
  });
});

describe('getProfiles', () => {
  it('fails the build on a profile whose role is not in the vocabulary', async () => {
    serve({
      '/v1/public/vocabulary': vocabularyPayload,
      '/v1/public/profiles': { items: [profileWire], page: 1, perPage: 100, totalItems: 1 },
    });

    await expect(getProfiles()).rejects.toThrow(/Record: PA-1C2D3E[\s\S]*roles\.1: unknown value "ml"/);
  });
});
