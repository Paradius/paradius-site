import {
  ORG,
  ORG_DESCRIPTION,
  ORG_KNOWS_ABOUT,
  PROFESSIONAL_SERVICE_DESCRIPTION,
  SERVICE_TYPES,
  SITE_URL,
} from './constants';
import type { PageSeo } from './types';

/** Organization — primary entity (exact data from landing_page/index.html). */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG.name,
    legalName: ORG.legalName,
    alternateName: [...ORG.alternateNames],
    url: SITE_URL,
    logo: ORG.logo,
    description: ORG_DESCRIPTION,
    foundingDate: ORG.foundingDate,
    founder: {
      '@type': 'Person',
      name: ORG.founder.name,
      url: ORG.founder.url,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.address.streetAddress,
      addressLocality: ORG.address.addressLocality,
      addressRegion: ORG.address.addressRegion,
      postalCode: ORG.address.postalCode,
      addressCountry: ORG.address.addressCountry,
    },
    areaServed: ORG.areaServed,
    email: ORG.email,
    sameAs: [ORG.linkedIn],
    knowsAbout: [...ORG_KNOWS_ABOUT],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 10,
    },
    slogan: ORG.slogan,
  };
}

/** ProfessionalService — for Google local/service results. */
export function buildProfessionalServiceJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: ORG.name,
    legalName: ORG.legalName,
    url: SITE_URL,
    description: PROFESSIONAL_SERVICE_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.address.streetAddress,
      addressLocality: ORG.address.addressLocality,
      addressRegion: ORG.address.addressRegion,
      postalCode: ORG.address.postalCode,
      addressCountry: ORG.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: ORG.geo.latitude,
      longitude: ORG.geo.longitude,
    },
    areaServed: ORG.areaServed,
    serviceType: [...SERVICE_TYPES],
    email: ORG.email,
    priceRange: '$$$',
    sameAs: [ORG.linkedIn],
  };
}

/** WebSite — helps Google understand site identity. */
export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG.name,
    alternateName: ORG.legalName,
    url: SITE_URL,
    publisher: {
      '@type': 'Organization',
      name: ORG.name,
      legalName: ORG.legalName,
    },
  };
}

/** WebPage — parameterized per route. */
export function buildWebPageJsonLd(page: PageSeo): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.webPageName,
    description: page.webPageDescription,
    url: page.canonical,
    isPartOf: {
      '@type': 'WebSite',
      name: ORG.name,
      url: SITE_URL,
    },
    about: {
      '@type': 'Organization',
      name: ORG.legalName,
    },
  };

  if (page.speakableSelectors && page.speakableSelectors.length > 0) {
    jsonLd.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: [...page.speakableSelectors],
    };
  }

  return jsonLd;
}

/** All four JSON-LD blocks for a page (serialized in `<head>`). */
export function buildAllJsonLd(page: PageSeo): readonly Record<string, unknown>[] {
  return [
    buildOrganizationJsonLd(),
    buildProfessionalServiceJsonLd(),
    buildWebSiteJsonLd(),
    buildWebPageJsonLd(page),
  ] as const;
}
