import { randomBytes } from 'crypto';

/** URL-safe slug from an arbitrary string. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

/** Human-friendly confirmation / reference codes, e.g. "CPMS-7F3K9Q". */
export function generateCode(prefix = '', length = 6): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return prefix ? `${prefix}-${out}` : out;
}
