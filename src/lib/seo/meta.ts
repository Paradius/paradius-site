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
  const ogTitle =
    page.ogTitle ??
    page.title.replace(' — Paradius LLC', '').replace(' | High-End Software Engineering Consultancy — Paradius LLC', ' | High-End Software Engineering Consultancy');

  return {
    title: page.title,
    description: page.description,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large',
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
      'Paradius LLC is a software engineering consultancy that puts architecture first and engineers first. System design, cross-platform development, and technical integrity. Based in Sheridan, Wyoming.',
    ogSiteName: 'Paradius',
    ogLocale: 'en_US',
    twitterCard: 'summary',
    twitterTitle: ogTitle,
    twitterDescription:
      page.twitterDescription ??
      'Paradius LLC — architecture-first software engineering. System design, cross-platform development, technical integrity. Sheridan, Wyoming.',
    twitterSite: '@paradius_dev',
  };
}

/** Home page SEO — exact meta values from landing_page/index.html. */
export const HOME_SEO: PageSeo = {
  title: 'Paradius | High-End Software Engineering Consultancy — Paradius LLC',
  description:
    'Paradius is a high-end software engineering consultancy registered in Wyoming, USA. Paradius LLC specializes in system architecture, scalable back-end systems, cross-platform development, and technical consulting. Architecture-first. Engineer-first.',
  canonical: 'https://paradius.dev/',
  ogTitle: 'Paradius | High-End Software Engineering Consultancy',
  ogDescription:
    'Paradius LLC is a software engineering consultancy that puts architecture first and engineers first. System design, cross-platform development, and technical integrity. Based in Sheridan, Wyoming.',
  twitterDescription:
    'Paradius LLC — architecture-first software engineering. System design, cross-platform development, technical integrity. Sheridan, Wyoming.',
  webPageName: 'Paradius — High-End Software Engineering Consultancy',
  webPageDescription:
    'Paradius LLC is a software engineering consultancy specializing in system architecture, cross-platform development, and technical integrity. Based in Sheridan, Wyoming.',
  speakableSelectors: ['#hero-heading', '#philosophy-heading', '#expertise-heading'],
};
