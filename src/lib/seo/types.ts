/** Per-page SEO configuration consumed by meta and JSON-LD builders. */
export interface PageSeo {
  /** Full document title (includes brand suffix where applicable). */
  title: string;
  /** Primary meta description. */
  description: string;
  /** Absolute canonical URL (trailing slash for home). */
  canonical: string;
  /** Open Graph title (defaults to title without LLC suffix). */
  ogTitle?: string;
  /** Open Graph description. */
  ogDescription?: string;
  /** Twitter description (may differ slightly from OG). */
  twitterDescription?: string;
  /** Comma-separated keywords meta (home uses the landing default). */
  keywords?: string;
  /** WebPage JSON-LD `name` field. */
  webPageName: string;
  /** WebPage JSON-LD `description` field. */
  webPageDescription: string;
  /** CSS selectors for SpeakableSpecification (home page headings). */
  speakableSelectors?: readonly string[];
  /** Override robots meta (mockups use noindex). */
  robots?: string;
}
