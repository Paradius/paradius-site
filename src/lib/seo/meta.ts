import { DEFAULT_KEYWORDS, ORG } from './constants';
import type { PageSeo } from './types';

export interface ResolvedPageMeta {
  title: string;
  description: string;
  robots: string;
  author: string;
  keywords: string;
  canonical: string;
  geoRegion: string;
  geoPlacename: string;
  ogType: string;
  ogUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogSiteName: string;
  ogLocale: string;
  ogImage: string;
  ogImageAlt: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterSite: string;
  twitterImage: string;
}

/** Resolve meta/OG/Twitter/canonical tags for a page. */
export function resolvePageMeta(page: PageSeo): ResolvedPageMeta {
  // Site-wide title convention is `<page> | Paradius LLC`; social titles drop
  // the legal suffix and keep whatever precedes it.
  const ogTitle = page.ogTitle ?? page.title.replace(' | Paradius LLC', '');

  return {
    title: page.title,
    description: page.description,
    robots: page.robots ?? 'index, follow, max-snippet:-1, max-image-preview:large',
    author: 'Paradius LLC',
    keywords: page.keywords ?? DEFAULT_KEYWORDS,
    canonical: page.canonical,
    geoRegion: 'US-WY',
    geoPlacename: 'Sheridan, Wyoming',
    ogType: 'website',
    ogUrl: page.canonical,
    ogTitle,
    ogDescription:
      page.ogDescription ??
      'Paradius is a staff augmentation consultancy of senior nearshore engineers. Anonymous profiles under code names, US contracts, full overlap with US business hours from our Managua hub.',
    ogSiteName: 'Paradius',
    ogLocale: 'en_US',
    ogImage: ORG.image,
    ogImageAlt: 'Paradius logotype over From Roots We Build, the Dawn We Raise',
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription:
      page.twitterDescription ??
      'Paradius LLC: senior nearshore engineers under anonymous codes. US contracts, full US overlap, architecture first. We build systems that endure.',
    twitterSite: '@paradius_dev',
    twitterImage: ORG.image,
  };
}

/** Home page SEO: metadata for the `/` route. */
export const HOME_SEO: PageSeo = {
  // Kept under ~60 and ~160 characters so search results show them whole.
  title: 'Paradius | High-End Software Engineering Consultancy',
  description:
    'Paradius LLC: staff augmentation with senior nearshore engineers chosen by code, not by name. Pick from the registry or let us run the team. US contracts.',
  canonical: 'https://paradius.dev/',
  ogTitle: 'Paradius | High-End Software Engineering Consultancy',
  ogDescription:
    'Senior nearshore engineers chosen by code, not by name. Pick them from the registry or have us run the team, then we disappear into your success.',
  twitterDescription:
    'Senior nearshore engineers chosen by code, not by name. US contracts, full US overlap. We build systems that endure.',
  webPageName: 'Paradius: High-End Software Engineering Consultancy',
  webPageDescription:
    'Paradius LLC is a staff augmentation consultancy. Senior nearshore engineers under anonymous codes, US contracts in USD, full overlap with US business hours from our Managua hub.',
  // Both ids live in the home v7 markup: the sr-only h1 and the confession line.
  speakableSelectors: ['#hero-heading', '#confession'],
};
