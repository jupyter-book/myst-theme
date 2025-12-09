import { describe, it, expect } from 'vitest';
import { withBaseurl } from './baseurl.js';

describe('withBaseurl', () => {
  it('should prepend baseurl to internal paths', () => {
    expect(withBaseurl('/about', '/base')).toBe('/base/about');
    expect(withBaseurl('/docs/page', '/base')).toBe('/base/docs/page');
  });

  it('should NOT prepend baseurl to external URLs', () => {
    expect(withBaseurl('http://example.com/page', '/base')).toBe('http://example.com/page');
    expect(withBaseurl('https://example.com/page', '/base')).toBe('https://example.com/page');
    expect(withBaseurl('mailto:foo@bar.com', '/base')).toBe('mailto:foo@bar.com');
  });

  it('should return url unchanged when baseurl is not provided', () => {
    expect(withBaseurl('/about')).toBe('/about');
    expect(withBaseurl('https://example.com')).toBe('https://example.com');
  });

  it('should normalize baseurl without leading slash', () => {
    expect(withBaseurl('/page', 'myst_test')).toBe('/myst_test/page');
  });

  it('should normalize baseurl with trailing slash', () => {
    expect(withBaseurl('/page', '/myst_test/')).toBe('/myst_test/page');
  });
});
