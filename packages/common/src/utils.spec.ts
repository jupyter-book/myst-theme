import { describe, expect, test } from 'vitest';
import type { SiteManifest } from 'myst-config';
import { isFlatSite, parsePathname, getFooterLinks } from './utils.js';

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

describe('getFooterLinks group labels', () => {
  // A TOC with a genuine "Part" heading (no slug, no url) followed by a page,
  // then a `url:` external-link entry (no slug, but has a url) between two more
  // pages -- mirroring a TOC that nests a reference link as a child of a page.
  const config: SiteManifest = {
    myst: 'v1',
    projects: [
      {
        index: 'index',
        title: 'My Book',
        slug: 'my-book',
        pages: [
          { slug: 'a', title: 'Page A', level: 1 },
          { title: 'Part Two', level: 1 },
          { slug: 'b', title: 'Page B', level: 2 },
          { title: 'External Reference', url: 'https://example.com/ref', level: 3 },
          { slug: 'c', title: 'Page C', level: 2 },
          { slug: 'd', title: 'Page D', level: 2 },
        ],
      },
    ],
  };

  test('a url-only TOC entry does not leak its title into later pages as a group', () => {
    const links = getFooterLinks(config, 'my-book', 'd');
    expect(links.navigation?.prev?.group).toBe('Part Two');
    expect(links.navigation?.prev?.group).not.toBe('External Reference');
  });

  test('a genuine Part heading (no slug, no url) still starts a new group', () => {
    const links = getFooterLinks(config, 'my-book', 'c');
    expect(links.navigation?.prev?.group).toBe('Part Two');
  });
});
