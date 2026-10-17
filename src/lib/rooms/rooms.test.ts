import { describe, expect, it } from 'vitest';
import { onePagerFile, parseJobDescription, positionSlug, stageLabel } from './rooms';

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
