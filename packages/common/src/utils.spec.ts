import { describe, expect, test, it } from 'vitest';
import { isFlatSite, parsePathname, normalizeBaseURL } from './utils.js';

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
