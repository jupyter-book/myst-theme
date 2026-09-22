import { describe, expect, test } from 'vitest';
import { isFlatSite, parsePathname, getBreadcrumbs } from './utils.js';
import type { SiteManifest } from 'myst-config';

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

function makeConfig(pages: Record<string, unknown>[]): SiteManifest {
  return {
    myst: 'v1',
    projects: [{ slug: undefined, index: 'index', title: 'Test Project', pages }],
  } as unknown as SiteManifest;
}

describe('getBreadcrumbs', () => {
  const config = makeConfig([
    { slug: 'guide', title: 'Guide', level: 1 },
    { slug: 'reference.index', title: 'Reference', short_title: 'Ref', level: 1 },
    { slug: 'reference.blocks', title: 'Blocks', level: 2 },
    { slug: 'reference.breadcrumbs.index', title: 'Breadcrumbs', level: 2 },
    { slug: 'reference.breadcrumbs.child', title: 'Child Page', level: 3 },
  ]);

  test('returns empty for index page, undefined slug, unknown slug', () => {
    expect(getBreadcrumbs(config, undefined, 'index')).toEqual([]);
    expect(getBreadcrumbs(config, undefined, undefined)).toEqual([]);
    expect(getBreadcrumbs(config, undefined, 'nonexistent')).toEqual([]);
  });

  test('level-1 page', () => {
    expect(getBreadcrumbs(config, undefined, 'guide')).toEqual([
      { title: 'Test Project', path: '/' },
      { title: 'Guide' },
    ]);
  });

  test('level-3 page, preferring short_title', () => {
    expect(getBreadcrumbs(config, undefined, 'reference.breadcrumbs.child')).toEqual([
      { title: 'Test Project', path: '/' },
      { title: 'Ref', path: '/reference' },
      { title: 'Breadcrumbs', path: '/reference/breadcrumbs' },
      { title: 'Child Page' },
    ]);
  });

  test('nested page with no level-1 ancestor goes straight to the root', () => {
    const noParent = makeConfig([{ slug: 'solo', title: 'Solo', level: 2 }]);
    expect(getBreadcrumbs(noParent, undefined, 'solo')).toEqual([
      { title: 'Test Project', path: '/' },
      { title: 'Solo' },
    ]);
  });

  test('slug-less "Part" heading is an unlinked crumb', () => {
    const withPart = makeConfig([
      { title: 'Part 1', level: 1 },
      { slug: 'part1.chapter2', title: 'Chapter 2', level: 2 },
    ]);
    expect(getBreadcrumbs(withPart, undefined, 'part1.chapter2')).toEqual([
      { title: 'Test Project', path: '/' },
      { title: 'Part 1' },
      { title: 'Chapter 2' },
    ]);
  });
});
