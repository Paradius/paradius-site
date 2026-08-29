import { DEFAULT_KEYWORDS } from './constants';
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
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterSite: string;
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
    twitterCard: 'summary',
    twitterTitle: ogTitle,
    twitterDescription:
      page.twitterDescription ??
      'Paradius LLC: senior nearshore engineers under anonymous codes. US contracts, full US overlap, architecture first. We build systems that endure.',
    twitterSite: '@paradius_dev',
  };
}

/** Home page SEO: metadata for the `/` route. */
export const HOME_SEO: PageSeo = {
  title: 'Paradius | High-End Software Engineering Consultancy | Paradius LLC',
  description:
    'Paradius is a staff augmentation consultancy of senior nearshore engineers. Anonymous profiles under code names, US contracts, full US overlap from our Managua hub. We build systems that endure, and we disappear into your success.',
  canonical: 'https://paradius.dev/',
  ogTitle: 'Paradius | High-End Software Engineering Consultancy',
  ogDescription:
    'Paradius is a staff augmentation consultancy of senior nearshore engineers. Anonymous profiles under code names, US contracts, full overlap with US business hours from our hub in Managua, Nicaragua.',
  twitterDescription:
    'Paradius LLC: senior nearshore engineers under anonymous codes. US contracts, full US overlap, architecture first. We build systems that endure.',
  webPageName: 'Paradius: High-End Software Engineering Consultancy',
  webPageDescription:
    'Paradius LLC is a staff augmentation consultancy. Senior nearshore engineers under anonymous codes, US contracts in USD, full overlap with US business hours from our Managua hub.',
  // Both ids live in the home v7 markup: the sr-only h1 and the confession line.
  speakableSelectors: ['#hero-heading', '#confession'],
};
