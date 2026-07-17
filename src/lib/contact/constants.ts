/** Inbound lead notification mailbox (D5). */
export const CONTACT_EMAIL = 'solutions@paradius.dev' as const;

/** Wire value for public lead intake `source` field. */
export const LEAD_SOURCE = 'website' as const;

/** Honeypot field name — non-empty values trigger silent fake-accept on the API. */
export const HONEYPOT_FIELD = 'website' as const;
