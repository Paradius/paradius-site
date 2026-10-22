import { describe, expect, it } from 'vitest';
import { cardText, onePagerFile, opensOnePager, parseJobDescription, positionSlug, stageLabel } from './rooms';

describe('positionSlug', () => {
  it('turns a position title into a lowercase path segment', () => {
    expect(positionSlug('Embedded Software Principal, AMR')).toBe('embedded-software-principal-amr');
  });

  it('drops accents and repeated separators', () => {
    expect(positionSlug('  Ingeniería  de   Simulación / Isaac Sim ')).toBe('ingenieria-de-simulacion-isaac-sim');
  });
});

describe('onePagerFile', () => {
  it('names the PDF after the candidate code and the position', () => {
    expect(onePagerFile('PA-1AD739', 'embedded-software-principal-amr')).toBe('PA-1AD739-embedded-software-principal-amr.pdf');
  });
});

describe('stageLabel', () => {
  it('reads each stage the client can see', () => {
    expect(stageLabel('presented')).toBe('Presented');
    expect(stageLabel('client_interview')).toBe('Interview');
    expect(stageLabel('placed')).toBe('Selected');
    expect(stageLabel('out')).toBe('Not moving forward');
  });

  it('falls back to a readable form for a stage Core adds later', () => {
    expect(stageLabel('on_hold')).toBe('On hold');
  });
});

describe('parseJobDescription', () => {
  it('splits headings, subheadings, bullets and paragraphs', () => {
    const text = [
      'The role owns the firmware.',
      '',
      '## Key Responsibilities',
      '',
      'Technical Leadership',
      '- Define the architecture.',
      '- Mentor engineers.',
      '',
      'Reliability & Functional Safety',
      '- Design for fault tolerance.',
    ].join('\n');

    expect(parseJobDescription(text)).toEqual([
      { kind: 'paragraph', text: 'The role owns the firmware.' },
      { kind: 'heading', text: 'Key Responsibilities' },
      { kind: 'subheading', text: 'Technical Leadership' },
      { kind: 'list', items: ['Define the architecture.', 'Mentor engineers.'] },
      { kind: 'subheading', text: 'Reliability & Functional Safety' },
      { kind: 'list', items: ['Design for fault tolerance.'] },
    ]);
  });

  it('keeps a long line without a period as a paragraph', () => {
    const line = 'Experience with autonomous mobile robots in warehouse and industrial automation';
    expect(parseJobDescription(line)).toEqual([{ kind: 'paragraph', text: line }]);
  });
});

describe('cardText', () => {
  const profileFacts = ['Senior', 'English B2', 'Available now'];

  it('uses the presentation written with the one-pager', () => {
    const presentation = { headline: 'Staff Firmware Engineer', facts: ['Staff', 'English C1'] };
    expect(cardText('Profile headline', profileFacts, presentation)).toEqual({
      headline: 'Staff Firmware Engineer',
      facts: ['Staff', 'English C1'],
    });
  });

  it('falls back to the profile when the one-pager came without one', () => {
    expect(cardText('Profile headline', profileFacts, null)).toEqual({ headline: 'Profile headline', facts: profileFacts });
  });

  it('keeps the profile facts when the presentation only sets a headline', () => {
    expect(cardText('Profile headline', profileFacts, { headline: 'Senior Flutter Engineer', facts: [] })).toEqual({
      headline: 'Senior Flutter Engineer',
      facts: profileFacts,
    });
  });
});

describe('opensOnePager', () => {
  it('opens the one-pager of an available candidate', () => {
    expect(opensOnePager({ onePager: true, available: true })).toBe(true);
  });

  it('treats a candidate without the availability field as available', () => {
    expect(opensOnePager({ onePager: true })).toBe(true);
  });

  it('keeps the one-pager of an unavailable candidate closed', () => {
    expect(opensOnePager({ onePager: true, available: false })).toBe(false);
  });

  it('has nothing to open without a one-pager', () => {
    expect(opensOnePager({ onePager: false })).toBe(false);
  });
});
