import { CONTACT_EMAIL } from '../contact/constants';
import { SITE_URL } from './constants';
import type { PageSeo } from './types';

const CONTACT_CANONICAL = `${SITE_URL}/contact/` as const;

/** SEO config for the contact / conversion page. */
export function buildContactSeo(): PageSeo {
  return {
    title: 'Build Your Team — Paradius LLC',
    description:
      'Tell us who you need. Senior nearshore engineers, vetted and ready to present within 48 hours. We reply within 24 hours — rates scoped in private conversation.',
    canonical: CONTACT_CANONICAL,
    ogTitle: 'Build Your Team',
    ogDescription:
      'Start a staff augmentation conversation with Paradius — request vetted senior engineer profiles and assemble your nearshore team.',
    twitterDescription:
      'Contact Paradius to request senior nearshore engineer profiles. We reply within 24 hours.',
    webPageName: 'Contact Paradius',
    webPageDescription:
      'Contact form for staff augmentation inquiries — request engineer profiles and start building your nearshore team.',
    additionalJsonLd: [buildContactPageJsonLd()],
  };
}

/** ContactPage JSON-LD for the conversion page. */
export function buildContactPageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Paradius',
    description:
      'Start a staff augmentation conversation with Paradius LLC — request senior nearshore engineer profiles.',
    url: CONTACT_CANONICAL,
    mainEntity: {
      '@type': 'Organization',
      name: 'Paradius LLC',
      email: CONTACT_EMAIL,
      url: SITE_URL,
    },
  };
}
