import { describe, expect, it } from 'vitest';
import {
  formatCaseCode,
  formatRegistryStatus,
  formatStepCode,
  resolveActiveSection,
} from './registry';

describe('formatCaseCode', () => {
  it('zero-pads case codes', () => {
    expect(formatCaseCode(1)).toBe('CS-001');
    expect(formatCaseCode(12)).toBe('CS-012');
  });
});

describe('formatStepCode', () => {
  it('zero-pads step codes', () => {
    expect(formatStepCode(1)).toBe('STEP-01');
    expect(formatStepCode(10)).toBe('STEP-10');
  });
});

describe('formatRegistryStatus', () => {
  it('reports full catalog count', () => {
    expect(formatRegistryStatus(5)).toBe('Registry: 5 active profiles');
  });

  it('reports filtered count', () => {
    expect(formatRegistryStatus(5, 3)).toBe('Registry: 3 of 5 active profiles');
  });

  it('treats full visibility as unfiltered', () => {
    expect(formatRegistryStatus(5, 5)).toBe('Registry: 5 active profiles');
  });
});

describe('resolveActiveSection', () => {
  it('maps talent routes to registry', () => {
    expect(resolveActiveSection('/talent')).toBe('registry');
    expect(resolveActiveSection('/talent/PRD-001/')).toBe('registry');
  });

  it('maps work routes to evidence', () => {
    expect(resolveActiveSection('/work')).toBe('evidence');
    expect(resolveActiveSection('/work/some-slug/')).toBe('evidence');
  });

  it('returns null for other routes', () => {
    expect(resolveActiveSection('/')).toBeNull();
    expect(resolveActiveSection('/contact')).toBeNull();
  });
});
