import type { AnonymousProfile } from '../api';
import { SITE_URL } from './constants';
import type { PageSeo } from './types';

const TALENT_CANONICAL = `${SITE_URL}/talent/` as const;

/** SEO config for the talent catalog page. */
export function buildTalentCatalogSeo(profiles: readonly AnonymousProfile[]): PageSeo {
  return {
    title: 'Browse Our Talent — Paradius LLC',
    description:
      'Senior nearshore engineers, vetted and ready to present within 48 hours. Filter by role, stack, seniority, and availability — then request the profiles that fit your team.',
    canonical: TALENT_CANONICAL,
    ogTitle: 'Browse Our Talent',
    ogDescription:
      'Staff augmentation from Paradius — senior nearshore engineers across mobile, backend, frontend, and DevOps. Profiles presented within 48 hours.',
    twitterDescription:
      'Browse vetted senior engineers from Paradius. Filter by stack and availability, request profiles within 48 hours.',
    webPageName: 'Browse Our Talent',
    webPageDescription:
      'Paradius talent catalog — anonymous senior engineer profiles available for staff augmentation engagements.',
    additionalJsonLd: [buildTalentCollectionJsonLd(profiles.length, profiles)],
  };
}

/** SEO config for an individual talent profile page. */
export function buildTalentProfileSeo(profile: AnonymousProfile): PageSeo {
  const canonical = `${SITE_URL}/talent/${profile.code}/`;
  const title = `${profile.code} — ${profile.headline} — Paradius LLC`;

  return {
    title,
    description: profile.summary,
    canonical,
    ogTitle: `${profile.code} — ${profile.headline}`,
    ogDescription: profile.summary,
    twitterDescription: profile.summary,
    webPageName: `${profile.code} — ${profile.headline}`,
    webPageDescription: profile.summary,
    additionalJsonLd: [buildTalentProfileItemPageJsonLd(profile, canonical)],
  };
}

/** CollectionPage + ItemList for the talent catalog (no PII). */
export function buildTalentCollectionJsonLd(
  profileCount: number,
  profiles: readonly AnonymousProfile[] = [],
): Record<string, unknown> {
  const itemListElement = profiles.map((profile, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}/talent/${profile.code}/`,
    name: profile.code,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Paradius Talent Catalog',
    description:
      'Anonymous senior engineer profiles available for staff augmentation through Paradius LLC.',
    url: TALENT_CANONICAL,
    numberOfItems: profileCount,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Paradius Engineer Profiles',
      numberOfItems: profileCount,
      itemListElement,
    },
  };
}

/** ItemPage JSON-LD for a single anonymous profile (code, headline, skills only). */
export function buildTalentProfileItemPageJsonLd(
  profile: AnonymousProfile,
  canonical: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: `${profile.code} — ${profile.headline}`,
    description: profile.summary,
    url: canonical,
    about: {
      '@type': 'Thing',
      identifier: profile.code,
      name: profile.code,
      description: profile.headline,
      knowsAbout: profile.stack.map((tag) => tag.replace(/-/g, ' ')),
    },
  };
}
