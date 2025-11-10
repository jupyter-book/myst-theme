/**
 * Generates a simple hash from a string for creating stable IDs
 */
export function hashString(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    // Multiply hash by 31 (via bit shift) and add current character
    // (hash << 5) - hash is equivalent to hash * 31
    hash = ((hash << 5) - hash) + char;
    // Convert to 32-bit integer to prevent overflow
    hash = hash & hash;
  }
  // Convert to base-36 (0-9, a-z) for a compact string representation
  return Math.abs(hash).toString(36);
}
