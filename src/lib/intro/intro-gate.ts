/** Bump the version to replay the intro once for every browser that already saw it. */
export const INTRO_SEEN_KEY = 'paradius-intro-v1';

export interface IntroGateInput {
  search: string;
  seen: string | null;
  reducedMotion: boolean;
}

/**
 * Self-contained on purpose: BaseLayout inlines it with toString() so the
 * decision lands before first paint. No imports, no closures.
 */
export function shouldPlayIntro(input: IntroGateInput): boolean {
  const query = new URLSearchParams(input.search).get('intro');
  if (query === '1') return true;
  if (query === 'off' || query === '0') return false;
  return input.seen === null && !input.reducedMotion;
}
