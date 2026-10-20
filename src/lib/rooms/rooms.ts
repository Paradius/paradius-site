const STAGE_LABELS: Record<string, string> = {
  presented: 'Presented',
  client_interview: 'Interview',
  placed: 'Selected',
  out: 'Not moving forward',
};

/** Shorter than this and without a closing period, a JD line reads as a subheading. */
const SUBHEADING_MAX = 40;

export type JobDescriptionBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

export function positionSlug(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function onePagerFile(code: string, slug: string): string {
  return `${code}-${slug}.pdf`;
}

export function stageLabel(stage: string): string {
  const known = STAGE_LABELS[stage];
  if (known) {
    return known;
  }
  const words = stage.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Reads the JD text Core stores: `## ` headings, `- ` bullets, short label lines, paragraphs. */
export function parseJobDescription(text: string): JobDescriptionBlock[] {
  const blocks: JobDescriptionBlock[] = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length > 0) {
      blocks.push({ kind: 'list', items });
      items = [];
    }
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith('- ')) {
      items.push(line.slice(2).trim());
      continue;
    }
    flush();
    if (line.startsWith('## ')) {
      blocks.push({ kind: 'heading', text: line.slice(3).trim() });
    } else if (line.length < SUBHEADING_MAX && !line.endsWith('.')) {
      blocks.push({ kind: 'subheading', text: line });
    } else {
      blocks.push({ kind: 'paragraph', text: line });
    }
  }
  flush();
  return blocks;
}

export type CardPresentation = { headline: string | null; facts: string[] } | null | undefined;

/** What a room card reads: the presentation written with the one-pager, the profile where it is silent. */
export function cardText(
  profileHeadline: string,
  profileFacts: string[],
  presentation: CardPresentation,
): { headline: string; facts: string[] } {
  return {
    headline: presentation?.headline ?? profileHeadline,
    facts: presentation && presentation.facts.length > 0 ? presentation.facts : profileFacts,
  };
}
