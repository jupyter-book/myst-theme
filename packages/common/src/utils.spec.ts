import { describe, expect, test, it, afterEach, vi } from 'vitest';
import {
  isFlatSite,
  parsePathname,
  normalizeBaseURL,
  resolveBaseURL,
  baseURLPath,
  getLinkBaseURL,
  RELATIVE_BASE_URL_PLACEHOLDER,
} from './utils.js';

describe('utils', () => {
  test('isFlatSite true', () => {
    expect(
      isFlatSite({
        myst: 'v1',
        projects: [
          {
            index: '',
            title: '',
            pages: [],
            slug: undefined,
          },
        ],
      }),
    ).toBe(true);
  });
  test('isFlatSite false', () => {
    expect(
      isFlatSite({
        myst: 'v1',
        projects: [
          {
            index: '',
            title: '',
            pages: [],
            slug: 'asdf',
          },
        ],
      }),
    ).toBe(false);
  });
});

describe('parsePathname', () => {
  test('trailing slash produces same parts as without', () => {
    expect(parsePathname('/community/')).toEqual(['community']);
    expect(parsePathname('/community')).toEqual(['community']);
    expect(parsePathname('/project/page/')).toEqual(['project', 'page']);
  });
});

describe('normalizeBaseURL', () => {
  it('strips a trailing slash', () => {
    expect(normalizeBaseURL('/base/')).toBe('/base');
  });

  it('strips multiple trailing slashes', () => {
    expect(normalizeBaseURL('/base///')).toBe('/base');
  });

  it('leaves a baseURL without a trailing slash unchanged', () => {
    expect(normalizeBaseURL('/base')).toBe('/base');
  });
});

describe('resolveBaseURL', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leaves base URLs unchanged during server rendering', () => {
    expect(resolveBaseURL('../..')).toBe('../..');
  });

  it('leaves absolute base URLs unchanged', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/docs/a/b/' } });
    expect(resolveBaseURL('/docs')).toBe('/docs');
    expect(resolveBaseURL('')).toBe('');
  });

  it('resolves relative base URLs against the current page', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/docs/a/b/' } });
    expect(resolveBaseURL('../..')).toBe('/docs');
    expect(resolveBaseURL('.')).toBe('/docs/a/b');
  });

  it('resolves a relative base URL at the domain root to an empty base URL', () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/' } });
    expect(resolveBaseURL('.')).toBe('');
  });
});

describe('baseURLPath', () => {
  it('normalizes a path', () => {
    expect(baseURLPath('/docs/')).toBe('/docs');
    expect(baseURLPath('')).toBe('');
  });

  it('takes the path of an absolute URL', () => {
    expect(baseURLPath('https://example.org/docs/')).toBe('/docs');
    expect(baseURLPath('https://example.org')).toBe('');
  });
});

describe('getLinkBaseURL', () => {
  const relativeConfig = { myst: 'v1', options: { relative_urls: true } } as any;

  it('uses the path of BASE_URL', () => {
    expect(getLinkBaseURL({ BASE_URL: '/docs' })).toBe('/docs');
    expect(getLinkBaseURL({ BASE_URL: 'https://example.org/docs' })).toBe('/docs');
    expect(getLinkBaseURL({})).toBe('');
  });

  it('uses the placeholder for static builds with relative_urls', () => {
    expect(
      getLinkBaseURL(
        { BASE_URL: 'https://example.org/docs' },
        { config: relativeConfig, staticBuild: true },
      ),
    ).toBe(RELATIVE_BASE_URL_PLACEHOLDER);
  });

  it('uses BASE_URL for relative_urls outside static builds', () => {
    expect(
      getLinkBaseURL({ BASE_URL: '/docs' }, { config: relativeConfig, staticBuild: false }),
    ).toBe('/docs');
  });

  it('uses BASE_URL for static builds without relative_urls', () => {
    expect(
      getLinkBaseURL({ BASE_URL: '/docs' }, { config: { myst: 'v1' } as any, staticBuild: true }),
    ).toBe('/docs');
  });
});
