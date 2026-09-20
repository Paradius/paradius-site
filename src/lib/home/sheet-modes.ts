/** Every home sheet is in exactly one mode. Cards are the declared exception. */
export const SHEET_MODES = ['voice', 'split', 'pair', 'cup'] as const;

export type SheetMode = (typeof SHEET_MODES)[number];

export function modesOf(classList: string): SheetMode[] {
  const classes = new Set(classList.split(/\s+/).filter(Boolean));
  return SHEET_MODES.filter((mode) => classes.has(`home-v7__row--${mode}`));
}
