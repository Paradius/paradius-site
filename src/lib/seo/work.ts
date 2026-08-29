import type { CaseStudy } from '../api';
import { SITE_URL } from './constants';
import type { PageSeo } from './types';

const WORK_CANONICAL = `${SITE_URL}/work/` as const;

/** SEO config for the case studies catalog page. */
export function buildWorkCatalogSeo(cases: readonly CaseStudy[]): PageSeo {
  return {
    title: 'Case Studies | Paradius LLC',
    description:
      'Anonymized case studies from Paradius staff augmentation engagements: systems built by senior nearshore engineers, adopted at scale and still running after we left. Profiles within 48 hours.',
    canonical: WORK_CANONICAL,
    ogTitle: 'Case Studies',
    ogDescription:
      'How Paradius engineers work: architecture first, systems that endure adoption at scale and outlive the engagement.',
    twitterDescription:
      'Paradius case studies: anonymized accounts of staff augmentation work that kept running after we left.',
    webPageName: 'Case Studies',
    webPageDescription:
      'Paradius anonymized case studies: staff augmentation engagements with the problem, the system, and what remained.',
    additionalJsonLd: [buildWorkCollectionJsonLd(cases)],
  };
}

/** SEO config for an individual case study page. */
export function buildWorkCaseSeo(caseStudy: CaseStudy): PageSeo {
  const canonical = `${SITE_URL}/work/${caseStudy.slug}/`;

  return {
    title: `${caseStudy.title} | Paradius LLC`,
    description: caseStudy.outcome,
    canonical,
    ogTitle: caseStudy.title,
    ogDescription: caseStudy.outcome,
    twitterDescription: caseStudy.outcome,
    webPageName: caseStudy.title,
    webPageDescription: caseStudy.outcome,
    additionalJsonLd: [buildWorkCaseArticleJsonLd(caseStudy, canonical)],
  };
}

/** CollectionPage + ItemList for /work (anonymized client descriptors only). */
export function buildWorkCollectionJsonLd(
  cases: readonly CaseStudy[],
): Record<string, unknown> {
  const itemListElement = cases.map((caseStudy, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}/work/${caseStudy.slug}/`,
    name: caseStudy.clientDescriptor,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Paradius Case Studies',
    description:
      'Anonymized case studies from Paradius staff augmentation engagements with senior nearshore engineers.',
    url: WORK_CANONICAL,
    numberOfItems: cases.length,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Paradius Case Studies',
      numberOfItems: cases.length,
      itemListElement,
    },
  };
}

/** Article JSON-LD for a single case study (no client names). */
export function buildWorkCaseArticleJsonLd(
  caseStudy: CaseStudy,
  canonical: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: caseStudy.title,
    description: caseStudy.outcome,
    url: canonical,
    about: {
      '@type': 'Thing',
      name: caseStudy.clientDescriptor,
      description: caseStudy.problem,
    },
    keywords: caseStudy.stack.map((tag) => tag.replace(/-/g, ' ')).join(', '),
  };
}
