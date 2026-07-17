import { defineCollection } from 'astro:content';

/**
 * Fixture data for offline builds (Phase S2). Schema validation lands in S2;
 * the collection is registered here so Astro does not auto-generate it.
 */
const fixtures = defineCollection({
  type: 'data',
});

export const collections = { fixtures };
