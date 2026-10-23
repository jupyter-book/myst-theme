import { describe, it, expect } from 'vitest';
import { isExternalUrl } from '@myst-theme/providers';

describe('isExternalUrl', () => {
  it('treats internal reference and static asset paths as internal', () => {
    expect(isExternalUrl('intro.md')).toBe(false);
    expect(isExternalUrl('./intro.md')).toBe(false);
    expect(isExternalUrl('/intro.md')).toBe(false);
    expect(isExternalUrl('./assets/logo.svg')).toBe(false);
    expect(isExternalUrl('/docs/page/')).toBe(false);
  });

  it('treats external urls as external', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('http://example.com')).toBe(true);
    expect(isExternalUrl('ftp://example.com/file.txt')).toBe(true);
    expect(isExternalUrl('mailto:foo@example.com')).toBe(true);
  });
});
