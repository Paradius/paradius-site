import { developerCodeSchema } from '../api/schemas';
import { CONTACT_EMAIL, LEAD_SOURCE } from './constants';

/** Form field names as rendered in the DOM (company maps to API `companyName`). */
export interface LeadFormFields {
  name: string;
  email: string;
  company: string;
  message: string;
  website: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  companyName: string;
  message: string;
  interestedProfiles: string[];
  source: typeof LEAD_SOURCE;
  website: string;
}

export type LeadFormFieldKey = 'name' | 'email' | 'company' | 'message';

export type FieldErrors = Partial<Record<LeadFormFieldKey, string>>;

export interface ClientValidationResult {
  valid: boolean;
  errors: FieldErrors;
}

export interface ApiProblemBody {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

export type SubmitErrorKind = 'validation' | 'rate_limited' | 'network' | 'no_api';

export interface SubmitError {
  kind: SubmitErrorKind;
  message: string;
  fieldErrors?: FieldErrors;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reads profile codes from URL search params.
 * Supports `profile` (singular, repeated), `profiles` (comma-separated and repeated).
 */
export function parseProfileParams(search: string): string[] {
  const params = new URLSearchParams(search);
  const raw: string[] = [];

  for (const value of params.getAll('profile')) {
    raw.push(...value.split(','));
  }

  for (const value of params.getAll('profiles')) {
    raw.push(...value.split(','));
  }

  const seen = new Set<string>();
  const codes: string[] = [];

  for (const entry of raw) {
    const trimmed = entry.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    const parsed = developerCodeSchema.safeParse(trimmed);
    if (parsed.success) {
      seen.add(trimmed);
      codes.push(trimmed);
    }
  }

  return codes;
}

/** Client-side validation mirroring the public lead intake DTO. */
export function validateLeadForm(fields: LeadFormFields): ClientValidationResult {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = 'Name is required';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!fields.company.trim()) {
    errors.company = 'Company is required';
  }

  if (!fields.message.trim()) {
    errors.message = 'Message is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/** Builds the JSON body for POST /v1/public/leads. */
export function buildLeadPayload(
  fields: LeadFormFields,
  interestedProfiles: readonly string[],
): LeadPayload {
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    companyName: fields.company.trim(),
    message: fields.message.trim(),
    interestedProfiles: [...interestedProfiles],
    source: LEAD_SOURCE,
    website: fields.website,
  };
}

/** Maps API problem `fields` keys to form field names for inline display. */
export function mapApiFieldErrors(
  apiFields: Record<string, string> | undefined,
): FieldErrors {
  if (!apiFields) {
    return {};
  }

  const mapped: FieldErrors = {};
  const keyMap: Record<string, LeadFormFieldKey> = {
    name: 'name',
    email: 'email',
    companyName: 'company',
    message: 'message',
  };

  for (const [apiKey, reason] of Object.entries(apiFields)) {
    const formKey = keyMap[apiKey];
    if (formKey) {
      mapped[formKey] = reason;
    }
  }

  return mapped;
}

/** Interprets a non-2xx leads API response into a user-facing submit error. */
export function mapSubmitHttpError(
  status: number,
  body: ApiProblemBody | null,
): SubmitError {
  if (status === 422 && body?.code === 'validation_error') {
    return {
      kind: 'validation',
      message: body.message ?? 'Please fix the highlighted fields.',
      fieldErrors: mapApiFieldErrors(body.fields),
    };
  }

  if (status === 429 && body?.code === 'rate_limited') {
    return {
      kind: 'rate_limited',
      message: 'Too many requests. Please try again in a minute.',
    };
  }

  return {
    kind: 'network',
    message: 'Something went wrong sending your inquiry.',
  };
}

/** Builds a mailto URL with prefilled subject and body for fallback paths. */
export function buildMailtoUrl(
  fields: LeadFormFields,
  interestedProfiles: readonly string[],
): string {
  const profilePart =
    interestedProfiles.length > 0
      ? `, Requisition: ${interestedProfiles.join(', ')}`
      : '';

  const subject = encodeURIComponent(`Team inquiry from ${fields.name.trim()}${profilePart}`);
  const bodyLines = [
    `Name: ${fields.name.trim()}`,
    `Email: ${fields.email.trim()}`,
    `Company: ${fields.company.trim()}`,
    '',
    interestedProfiles.length > 0
      ? `Requisition: ${interestedProfiles.join(', ')}`
      : '',
    '',
    fields.message.trim(),
  ].filter((line) => line !== '');

  const body = encodeURIComponent(bodyLines.join('\n'));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/** Whether the leads API endpoint is configured for client-side submission. */
export function isApiConfigured(apiBaseUrl: string | undefined | null): boolean {
  return Boolean(apiBaseUrl?.trim());
}

/** Resolves the full leads POST URL from a public API base. */
export function resolveLeadsEndpoint(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/$/, '')}/v1/public/leads`;
}
