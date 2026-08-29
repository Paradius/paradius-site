import { describe, expect, it } from 'vitest';
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd } from './jsonld';

describe('buildFaqPageJsonLd', () => {
  it('builds a schema.org FAQPage with mainEntity questions', () => {
    const jsonld = buildFaqPageJsonLd(
      [{ question: 'Who owns the IP?', answer: 'You do, from day one.' }],
      'https://paradius.dev/faq/',
    );
    expect(jsonld['@type']).toBe('FAQPage');
    expect(jsonld['@id']).toBe('https://paradius.dev/faq/');
    const entities = jsonld.mainEntity as Record<string, unknown>[];
    expect(entities).toHaveLength(1);
    expect(entities[0]['@type']).toBe('Question');
    expect(entities[0].name).toBe('Who owns the IP?');
    expect((entities[0].acceptedAnswer as Record<string, unknown>).text).toBe(
      'You do, from day one.',
    );
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('builds an ordered BreadcrumbList with 1-based positions', () => {
    const jsonld = buildBreadcrumbJsonLd([
      { name: 'Home', url: 'https://paradius.dev/' },
      { name: 'Work', url: 'https://paradius.dev/work/' },
    ]);
    expect(jsonld['@type']).toBe('BreadcrumbList');
    const items = jsonld.itemListElement as Record<string, unknown>[];
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
    expect(items[1].name).toBe('Work');
    expect(items[1].item).toBe('https://paradius.dev/work/');
  });
});
