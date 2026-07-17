import type { PageSeo } from './types';

/** SEO config for throwaway design-mockup routes (noindex). */
export function mockupSeo(title: string, path: string, description: string): PageSeo {
  return {
    title: `${title} — Design Mockup — Paradius`,
    description,
    canonical: `https://paradius.dev${path}`,
    robots: 'noindex, nofollow',
    webPageName: title,
    webPageDescription: description,
  };
}

export const MOCKUP_INDEX_SEO = mockupSeo(
  'Design Mockups',
  '/mockups/',
  'Phase S2.5 design mockups for talent catalog, profile detail, case studies, and contact — awaiting Gabriel approval.',
);
