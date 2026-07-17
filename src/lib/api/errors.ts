import type { ZodError } from 'zod';

/** Format a Zod validation failure into a build-stopping, human-readable message. */
export function formatValidationError(
  resource: string,
  recordId: string,
  error: ZodError,
): string {
  const fieldErrors = error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `    • ${path}: ${issue.message}`;
    })
    .join('\n');

  return [
    `[paradius-site] Invalid ${resource} data`,
    `  Record: ${recordId}`,
    '  Fields:',
    fieldErrors,
  ].join('\n');
}

/** Extract a stable identifier from a raw record for error messages. */
export function recordIdentifier(
  item: unknown,
  index: number,
  idField: string,
): string {
  if (item !== null && typeof item === 'object' && idField in item) {
    const value = (item as Record<string, unknown>)[idField];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return `index ${index}`;
}
