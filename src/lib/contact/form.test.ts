import { describe, expect, it } from 'vitest';
import {
  buildLeadPayload,
  buildMailtoUrl,
  isApiConfigured,
  mapApiFieldErrors,
  mapSubmitHttpError,
  parseProfileParams,
  resolveLeadsEndpoint,
  validateLeadForm,
} from './form';

const validFields = {
  name: 'Pat Buyer',
  email: 'pat@acme.example',
  company: 'Acme Corp',
  message: 'We need Flutter engineers.',
  website: '',
};

describe('parseProfileParams', () => {
  it('reads singular profile param', () => {
    expect(parseProfileParams('?profile=PA-28EFC9')).toEqual(['PA-28EFC9']);
  });

  it('reads repeated profile params', () => {
    expect(parseProfileParams('?profile=PA-28EFC9&profile=PA-587A1E')).toEqual([
      'PA-28EFC9',
      'PA-587A1E',
    ]);
  });

  it('reads comma-separated profiles param', () => {
    expect(parseProfileParams('?profiles=PA-28EFC9,PA-54B6E3')).toEqual([
      'PA-28EFC9',
      'PA-54B6E3',
    ]);
  });

  it('merges profile and profiles params with deduplication', () => {
    expect(
      parseProfileParams('?profile=PA-28EFC9&profiles=PA-28EFC9,PA-54B6E3&profile=PA-587A1E'),
    ).toEqual(['PA-28EFC9', 'PA-587A1E', 'PA-54B6E3']);
  });

  it('ignores invalid profile codes', () => {
    expect(parseProfileParams('?profile=INVALID&profile=PA-D1B6D4')).toEqual(['PA-D1B6D4']);
  });
});

describe('validateLeadForm', () => {
  it('accepts valid fields', () => {
    const result = validateLeadForm(validFields);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('requires all fields', () => {
    const result = validateLeadForm({
      name: '',
      email: '',
      company: '',
      message: '',
      website: '',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      company: expect.any(String),
      message: expect.any(String),
    });
  });

  it('rejects invalid email', () => {
    const result = validateLeadForm({ ...validFields, email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeTruthy();
  });
});

describe('buildLeadPayload', () => {
  it('maps form fields to API camelCase body', () => {
    expect(buildLeadPayload(validFields, ['PA-28EFC9', 'PA-587A1E'])).toEqual({
      name: 'Pat Buyer',
      email: 'pat@acme.example',
      companyName: 'Acme Corp',
      message: 'We need Flutter engineers.',
      interestedProfiles: ['PA-28EFC9', 'PA-587A1E'],
      source: 'website',
      website: '',
    });
  });

  it('includes honeypot field for bot detection', () => {
    const payload = buildLeadPayload({ ...validFields, website: 'https://spam.example' }, []);
    expect(payload.website).toBe('https://spam.example');
  });
});

describe('mapApiFieldErrors', () => {
  it('maps API field names to form field names', () => {
    expect(
      mapApiFieldErrors({
        companyName: 'Company name is required',
        email: 'Invalid email',
      }),
    ).toEqual({
      company: 'Company name is required',
      email: 'Invalid email',
    });
  });
});

describe('mapSubmitHttpError', () => {
  it('maps 422 validation errors', () => {
    const error = mapSubmitHttpError(422, {
      code: 'validation_error',
      message: 'Validation failed',
      fields: { name: 'Required' },
    });
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual({ name: 'Required' });
  });

  it('maps 429 rate limit', () => {
    const error = mapSubmitHttpError(429, { code: 'rate_limited', message: 'Slow down' });
    expect(error.kind).toBe('rate_limited');
    expect(error.message).toContain('minute');
  });

  it('maps other statuses to network error', () => {
    const error = mapSubmitHttpError(500, null);
    expect(error.kind).toBe('network');
  });
});

describe('buildMailtoUrl', () => {
  it('includes profile codes in subject when present', () => {
    const url = buildMailtoUrl(validFields, ['PA-28EFC9']);
    expect(url).toContain('mailto:solutions@paradius.dev');
    expect(decodeURIComponent(url)).toContain('PA-28EFC9');
  });
});

describe('api configuration helpers', () => {
  it('detects empty API base URL', () => {
    expect(isApiConfigured('')).toBe(false);
    expect(isApiConfigured(undefined)).toBe(false);
    expect(isApiConfigured('https://api.paradius.dev')).toBe(true);
  });

  it('resolves leads endpoint without trailing slash issues', () => {
    expect(resolveLeadsEndpoint('https://api.paradius.dev/')).toBe(
      'https://api.paradius.dev/v1/public/leads',
    );
  });
});
