import type { AstroIntegration } from 'astro';
import { loadPublicData } from '../src/lib/api/client';

/**
 * Validates public wire data at build (and dev server) start so invalid fixtures
 * or API responses fail before static pages are emitted.
 */
export function dataLayerIntegration(): AstroIntegration {
  return {
    name: 'paradius-data-layer',
    hooks: {
      'astro:build:start': async () => {
        await loadPublicData();
      },
      'astro:server:start': async () => {
        await loadPublicData();
      },
    },
  };
}
