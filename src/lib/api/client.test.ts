import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProfiles, getRoomOnePager, getRooms, getVocabulary, resetDataCache } from './client';

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

const roomWire = {
  slug: 'k3f9q2m8x7c4v1b6n5z0a2s4',
  client: 'Harbor Robotics',
  positions: [
    {
      title: 'Firmware Lead',
      summary: 'Owns the firmware.',
      description: null,
      candidates: [
        {
          candidacyId: 'c1',
          code: 'PA-1C2D3E',
          name: 'Ana Ruiz',
          headline: 'Embedded Engineer',
          seniority: 'senior',
          english: 'B2',
          availability: 'available',
          stage: 'presented',
          onePager: true,
        },
      ],
    },
  ],
};

describe('getRooms', () => {
  it('reads the rooms from Core with the rooms token', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    const fetchMock = serve({ '/v1/rooms': { items: [roomWire] } });

    const rooms = await getRooms();

    expect(rooms).toEqual([roomWire]);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer rooms-secret');
  });

  it('keeps the card presentation written with the one-pager', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    const presentation = { headline: 'Staff Firmware Engineer', facts: ['Staff', 'English C1'] };
    const candidate = { ...roomWire.positions[0]!.candidates[0]!, presentation };
    serve({ '/v1/rooms': { items: [{ ...roomWire, positions: [{ ...roomWire.positions[0]!, candidates: [candidate] }] }] } });

    const [room] = await getRooms();

    expect(room?.positions[0]?.candidates[0]?.presentation).toEqual(presentation);
  });

  it('keeps a candidate marked unavailable', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    const candidate = { ...roomWire.positions[0]!.candidates[0]!, available: false };
    serve({ '/v1/rooms': { items: [{ ...roomWire, positions: [{ ...roomWire.positions[0]!, candidates: [candidate] }] }] } });

    const [room] = await getRooms();

    expect(room?.positions[0]?.candidates[0]?.available).toBe(false);
  });

  it('keeps the state Core derives for a card', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    const candidate = { ...roomWire.positions[0]!.candidates[0]!, state: 'interviewed' };
    serve({ '/v1/rooms': { items: [{ ...roomWire, positions: [{ ...roomWire.positions[0]!, candidates: [candidate] }] }] } });

    const [room] = await getRooms();

    expect(room?.positions[0]?.candidates[0]?.state).toBe('interviewed');
  });

  it('builds without rooms when the token is missing', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', '');
    const fetchMock = serve({});

    expect(await getRooms()).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails the build on a room without an address', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    serve({ '/v1/rooms': { items: [{ ...roomWire, slug: '' }] } });

    await expect(getRooms()).rejects.toThrow(/Invalid room data[\s\S]*slug/);
  });

  it('keeps the token out of a failure message', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    serve({});

    await expect(getRooms()).rejects.toThrow(/404/);
    await expect(getRooms()).rejects.not.toThrow(/rooms-secret/);
  });

  it('reads a one-pager as bytes with the rooms token', async () => {
    vi.stubEnv('ROOMS_API_TOKEN', 'rooms-secret');
    const fetchMock = vi.fn(async () => new Response(new Uint8Array([0x25, 0x50, 0x44, 0x46]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const pdf = new Uint8Array(await getRoomOnePager('c1'));

    expect(String.fromCharCode(...pdf)).toBe('%PDF');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/v1/rooms/one-pagers/c1`);
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer rooms-secret');
  });
});
