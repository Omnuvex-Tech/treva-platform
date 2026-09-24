import type { TransformFnParams } from 'class-transformer';

/**
 * An empty string becomes `undefined` so `@IsOptional()` can do its job:
 * class-validator only skips `undefined` and `null`, so a form that posts every
 * field it owns — including the ones it did not draw — would otherwise fail
 * "A valid email is required" on a field nobody was asked to fill.
 *
 * A required address is unaffected: with no `@IsOptional()` beside it,
 * `@IsEmail` rejects `undefined` exactly as it rejected `''`.
 */
export function normalizeEmail({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  return normalized === '' ? undefined : normalized;
}

export function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * A list of strings, trimmed, with the blanks dropped — the shape a repeating
 * field posts when a row has been added and left empty.
 */
export function trimStringList({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') value = [value];
  if (!Array.isArray(value)) return value;

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
    .filter((entry) => entry !== '');
}
