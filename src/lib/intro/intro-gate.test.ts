import { describe, expect, it } from 'vitest';
import { INTRO_SEEN_KEY, shouldPlayIntro } from './intro-gate';

describe('shouldPlayIntro', () => {
  it('plays on a first visit with motion allowed', () => {
    expect(shouldPlayIntro({ search: '', seen: null, reducedMotion: false })).toBe(true);
  });

  it('skips once the browser has seen it', () => {
    expect(shouldPlayIntro({ search: '', seen: '1', reducedMotion: false })).toBe(false);
  });

  it('skips when the visitor prefers reduced motion', () => {
    expect(shouldPlayIntro({ search: '', seen: null, reducedMotion: true })).toBe(false);
  });

  it('replays on ?intro=1 even when seen and even with reduced motion', () => {
    expect(shouldPlayIntro({ search: '?intro=1', seen: '1', reducedMotion: true })).toBe(true);
  });

  it('skips on ?intro=off and ?intro=0 on a first visit', () => {
    expect(shouldPlayIntro({ search: '?intro=off', seen: null, reducedMotion: false })).toBe(false);
    expect(shouldPlayIntro({ search: '?intro=0', seen: null, reducedMotion: false })).toBe(false);
  });

  it('ignores other query values', () => {
    expect(shouldPlayIntro({ search: '?intro=maybe', seen: null, reducedMotion: false })).toBe(true);
  });

  it('exposes a versioned storage key so a redesign can replay once', () => {
    expect(INTRO_SEEN_KEY).toMatch(/^paradius-intro-v\d+$/);
  });
});
