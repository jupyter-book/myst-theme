import { createHash } from 'crypto';

/**
 * Generates a SHA-256 hash from a string
 */
export function hashString(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
