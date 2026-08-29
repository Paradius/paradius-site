/** Em-dash and en-dash are banned in all canon copy (PRODUCT.md text quality bar). */
const BANNED = ['—', '–'] as const;

export interface BannedDash {
  line: number;
  column: number;
  char: string;
}

export function findBannedDashes(text: string): BannedDash[] {
  const hits: BannedDash[] = [];
  const lines = text.split('\n');
  lines.forEach((lineText, lineIndex) => {
    for (let col = 0; col < lineText.length; col += 1) {
      const char = lineText[col];
      if ((BANNED as readonly string[]).includes(char)) {
        hits.push({ line: lineIndex + 1, column: col + 1, char });
      }
    }
  });
  return hits;
}
