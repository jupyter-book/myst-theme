import { describe, it, expect } from 'vitest';
import { withBaseurl, isExternalUrl, normalizeBaseurl } from './baseurl.js';

describe('normalizeBaseurl', () => {
  it('strips a trailing slash', () => {
    expect(normalizeBaseurl('/base/')).toBe('/base');
  });

  it('strips multiple trailing slashes', () => {
    expect(normalizeBaseurl('/base///')).toBe('/base');
  });

  it('leaves a baseurl without a trailing slash unchanged', () => {
    expect(normalizeBaseurl('/base')).toBe('/base');
  });

  it('passes through undefined', () => {
    expect(normalizeBaseurl(undefined)).toBe(undefined);
  });
});

describe('withBaseurl', () => {
  it('should prepend baseurl to internal paths', () => {
    expect(withBaseurl('/about', '/base')).toBe('/base/about');
    expect(withBaseurl('/docs/page', '/base')).toBe('/base/docs/page');
  });

  it('should not produce a double slash when baseurl has a trailing slash', () => {
    expect(withBaseurl('/about', '/base/')).toBe('/base/about');
  });

  it('should insert a separator when url has no leading slash', () => {
    // e.g. an unresolved cross-reference falling back to a bare relative path
    expect(withBaseurl('guides/docs', '/base')).toBe('/base/guides/docs');
  });

  it('should not double up the separator when both baseurl has a trailing slash and url lacks a leading one', () => {
    expect(withBaseurl('guides/docs', '/base/')).toBe('/base/guides/docs');
  });

  it('should return baseurl unchanged when url is empty', () => {
    expect(withBaseurl('', '/base')).toBe('/base');
    expect(withBaseurl(undefined, '/base')).toBe('/base');
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
});

describe('isExternalUrl', () => {
  it('treats relative and local paths as not external', () => {
    expect(isExternalUrl('intro.md')).toBe(false);
    expect(isExternalUrl('./intro.md')).toBe(false);
    expect(isExternalUrl('/intro.md')).toBe(false);
    expect(isExternalUrl('./assets/logo.svg')).toBe(false);
    expect(isExternalUrl('/docs/page/')).toBe(false);
  });

  it('treats URLs with schemes as external', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('http://example.com')).toBe(true);
    expect(isExternalUrl('ftp://example.com/file.txt')).toBe(true);
    expect(isExternalUrl('mailto:foo@example.com')).toBe(true);
  });

  it('treats matching internal domains as not external', () => {
    expect(isExternalUrl('https://example.com/page', 'example.com')).toBe(false);
    expect(isExternalUrl('http://example.com/page', 'example.com')).toBe(false);
    expect(isExternalUrl('https://other.com/page', 'example.com')).toBe(true);
  });

  it('supports wildcard subdomain patterns', () => {
    expect(isExternalUrl('https://docs.example.com/page', '*.example.com')).toBe(false);
    expect(isExternalUrl('https://example.com', '*.example.com')).toBe(true);
  });

  it('does not support trailing wildcard subdomain patterns', () => {
    expect(isExternalUrl('https://docs.example.com/page', 'example.*')).toBe(true);
    expect(isExternalUrl('https://example.com', 'example.*')).toBe(true);
  });

  it('matches internal domains with port numbers', () => {
    expect(isExternalUrl('https://example.com:8080/page', 'example.com')).toBe(false);
    expect(isExternalUrl('http://example.com:3000', 'example.com')).toBe(false);
  });

  it('returns false for undefined or empty url', () => {
    expect(isExternalUrl(undefined)).toBe(false);
    expect(isExternalUrl('')).toBe(false);
  });

  it('does not allow cheeky regexes', () => {
    expect(isExternalUrl('https://docs.example.com/page', '[^@]+')).toBe(true);
  });
});
