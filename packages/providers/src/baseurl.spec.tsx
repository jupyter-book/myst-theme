import { describe, it, expect } from 'vitest';
import { withBaseurl, isExternalUrl } from './baseurl.js';

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
