import { createHash } from 'node:crypto';

export function sha256Text(value: string): string {
  return createHash('sha256').update(value, 'utf-8').digest('hex');
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortValue(entry)])
    );
  }
  return value;
}

export function stableHash(value: unknown): string {
  return sha256Text(JSON.stringify(sortValue(value)));
}
