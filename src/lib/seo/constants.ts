/** Canonical site origin — must match astro.config `site`. */
export const SITE_URL = 'https://paradius.dev' as const;

/** Shared Organization / ProfessionalService fields from the live landing. */
export const ORG = {
  name: 'Paradius',
  legalName: 'Paradius LLC',
  alternateNames: ['Paradius LLC', 'Paradius Software', 'Paradius Dev'] as const,
  email: 'solutions@paradius.dev',
  foundingDate: '2026',
  slogan: 'Architecting the dawn from within',
  logo: `${SITE_URL}/assets/paradius_logo.svg`,
  linkedIn: 'https://www.linkedin.com/company/paradius/',
  founder: {
    name: 'Gabriel Chorens',
    url: 'https://www.linkedin.com/in/gabrielchorens/',
  },
  address: {
    streetAddress: '30 N Gould St, STE R',
    addressLocality: 'Sheridan',
    addressRegion: 'WY',
    postalCode: '82801',
    addressCountry: 'US',
  },
  geo: {
    latitude: 44.7972,
    longitude: -106.9561,
  },
  areaServed: 'Worldwide',
} as const;

export const ORG_DESCRIPTION =
  'Paradius is a high-end software engineering consultancy. We specialize in system architecture, cross-platform development, scalable back-end systems, and technical consulting. Architecture-first, engineer-first.';

export const ORG_KNOWS_ABOUT = [
  'Software Architecture',
  'System Design',
  'Cross-Platform Development',
  'Mobile Development',
  'Back-End Engineering',
  'Technical Consulting',
  'Enterprise Software',
  'Digital Transformation',
  'Legacy System Modernization',
] as const;

export const SERVICE_TYPES = [
  'Enterprise Software Engineering',
  'System Architecture Design',
  'Cross-Platform Development',
  'Scalable Back-End Systems',
  'Technical Consulting',
  'Digital Transformation',
  'Legacy System Modernization',
] as const;

export const PROFESSIONAL_SERVICE_DESCRIPTION =
  'Paradius LLC provides high-end software engineering consulting services including system architecture design, cross-platform engineering, scalable back-end systems, and technical integrity audits.';

/** Default meta keywords from the live landing home page. */
export const DEFAULT_KEYWORDS =
  'Paradius, Paradius LLC, Paradius software, Paradius engineering, Paradius consultancy, Paradius dev, paradius.dev, software engineering consultancy, system architecture, cross-platform development, technical consulting, Wyoming software company, high-end software engineering';
