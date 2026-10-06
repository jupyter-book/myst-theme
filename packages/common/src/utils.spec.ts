import { describe, expect, test, it, afterEach, vi } from 'vitest';
import {
  isFlatSite,
  parsePathname,
  normalizeBaseURL,
  resolveBaseURL,
  baseURLPath,
  getLinkBaseURL,
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
  it('uses the path of BASE_URL', () => {
    expect(getLinkBaseURL({ BASE_URL: '/docs' })).toBe('/docs');
    expect(getLinkBaseURL({ BASE_URL: 'https://example.org/docs' })).toBe('/docs');
    expect(getLinkBaseURL({})).toBe('');
  });

  it('prefers MYST_LINK_BASE_URL over BASE_URL', () => {
    expect(
      getLinkBaseURL({
        BASE_URL: 'https://example.org/docs',
        MYST_LINK_BASE_URL: '/__placeholder__',
      }),
    ).toBe('/__placeholder__');
  });
});
