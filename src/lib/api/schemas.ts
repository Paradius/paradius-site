import { z } from 'zod';

/** Matches `DeveloperCode` in core_models: `PRD-NNN`. */
export const developerCodeSchema = z
  .string()
  .regex(/^PRD-\d{3}$/, 'Developer code must match PRD-NNN (e.g. PRD-007)');

export const senioritySchema = z.enum(['junior', 'mid', 'senior', 'staff']);

export const availabilitySchema = z.enum(['available', 'soon', 'unavailable']);

export const developerRoleSchema = z.enum([
  'mobile',
  'backend',
  'frontend',
  'fullstack',
  'devops',
]);

export const spokenLanguageSchema = z.object({
  lang: z.string().min(1),
  level: z.string().min(1),
});

export const anonymousExperienceEntrySchema = z.object({
  role: z.string().min(1),
  startDate: z.string().min(1),
  industryDescriptor: z.string().min(1),
  endDate: z.string().min(1).optional(),
  achievements: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
});

export const anonymousProfileSchema = z.object({
  code: developerCodeSchema,
  headline: z.string().min(1),
  seniority: senioritySchema,
  yearsExperience: z.number().int().nonnegative(),
  summary: z.string().min(1),
  availability: availabilitySchema,
  roles: z.array(developerRoleSchema).default([]),
  stack: z.array(z.string()).default([]),
  experience: z.array(anonymousExperienceEntrySchema).default([]),
  languages: z.array(spokenLanguageSchema).default([]),
});

export const caseStudySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  clientDescriptor: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  stack: z.array(z.string()).default([]),
  outcome: z.string().min(1),
  published: z.boolean().default(false),
});

/**
 * Paginated list envelope returned by `GET /v1/public/profiles` and
 * `GET /v1/public/cases` (camelCase wire format).
 */
export function paginatedEnvelopeSchema<T extends z.ZodType>(itemSchema: T) {
  return z
    .object({
      items: z.array(itemSchema),
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
    });
}

export const profilesResponseSchema = paginatedEnvelopeSchema(anonymousProfileSchema);
export const casesResponseSchema = paginatedEnvelopeSchema(caseStudySchema);

export type AnonymousProfile = z.infer<typeof anonymousProfileSchema>;
export type AnonymousExperienceEntry = z.infer<typeof anonymousExperienceEntrySchema>;
export type SpokenLanguage = z.infer<typeof spokenLanguageSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Seniority = z.infer<typeof senioritySchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type DeveloperRole = z.infer<typeof developerRoleSchema>;
export type PaginatedProfilesResponse = z.infer<typeof profilesResponseSchema>;
export type PaginatedCasesResponse = z.infer<typeof casesResponseSchema>;
