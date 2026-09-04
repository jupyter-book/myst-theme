import { afterEach, describe, expect, it } from 'vitest';
import type { SiteManifest } from 'myst-config';
import { createRobotsTxt } from './seo/robots.js';
import { createSitemap } from './seo/sitemap.js';
import { getBaseUrl, getSiteUrl, normalizeSiteUrl } from './utils.js';

const request = new Request('http://localhost:3000/page');
const config = (url?: string) =>
  ({ url }) as SiteManifest & {
    url?: string;
  };

afterEach(() => {
  delete process.env.SITE_URL;
  delete process.env.BASE_URL;
  delete process.env.READTHEDOCS_CANONICAL_URL;
});

describe('getSiteUrl', () => {
  it('uses SITE_URL with highest precedence and normalizes its trailing slash', () => {
    process.env.SITE_URL = 'https://deploy.example.org/docs/';
    process.env.READTHEDOCS_CANONICAL_URL = 'https://rtd.example.org/project/';
    expect(getSiteUrl(request, config('https://config.example.org/'))).toBe(
      'https://deploy.example.org/docs',
    );
  });

  it('uses site.url before Read the Docs', () => {
    process.env.READTHEDOCS_CANONICAL_URL = 'https://rtd.example.org/project/';
    expect(getSiteUrl(request, config('https://config.example.org/docs/'))).toBe(
      'https://config.example.org/docs',
    );
  });

  it('preserves the full Read the Docs canonical URL', () => {
    process.env.READTHEDOCS_CANONICAL_URL = 'https://docs.example.org/en/latest/';
    expect(getSiteUrl(request)).toBe('https://docs.example.org/en/latest');
  });

  it('falls back to the request origin and BASE_URL', () => {
    process.env.BASE_URL = '/repository/';
    expect(getSiteUrl(request)).toBe('http://localhost:3000/repository');
  });

  it('produces complete SEO URLs for a subpath deployment', () => {
    process.env.SITE_URL = 'https://example.org/docs';
    const siteUrl = getSiteUrl(request);
    const sitemap = createSitemap(siteUrl, ['/page']);
    const robots = createRobotsTxt(siteUrl);
    expect(sitemap).toContain('<loc>https://example.org/docs/page</loc>');
    expect(sitemap).toContain('href="https://example.org/docs/sitemap_style.xsl"');
    expect(robots).toContain('Sitemap: https://example.org/docs/sitemap.xml');
    expect(`${sitemap}\n${robots}`).not.toContain('localhost');
  });

  it('does not infer a URL from domains', () => {
    expect(getSiteUrl(request, { domains: ['example.org'] } as SiteManifest)).toBe(
      'http://localhost:3000',
    );
  });
});

describe('normalizeSiteUrl', () => {
  it.each([
    'example.org',
    '/docs',
    'ftp://example.org',
    'https://example.org?q=1',
    'https://example.org#docs',
  ])('rejects %s', (value) => expect(() => normalizeSiteUrl(value)).toThrow());
});

describe('getBaseUrl', () => {
  it('normalizes a path-only BASE_URL', () => {
    process.env.BASE_URL = '/repository///';
    expect(getBaseUrl()).toBe('/repository');
  });

  it('infers BASE_URL from site.url', () => {
    expect(getBaseUrl(config('https://example.org/docs/'))).toBe('/docs');
  });

  it('rejects a BASE_URL that conflicts with site.url', () => {
    process.env.BASE_URL = '/guide';
    expect(() => getBaseUrl(config('https://example.org/docs'))).toThrow(/conflicts/);
  });

  it('rejects an explicit root BASE_URL that conflicts with site.url', () => {
    process.env.BASE_URL = '/';
    expect(() => getBaseUrl(config('https://example.org/docs'))).toThrow(/conflicts/);
  });

  it.each([
    'https://example.org/docs',
    '//example.org/docs',
    '/docs?preview=true',
    '/docs#section',
  ])('rejects a non-path BASE_URL: %s', (value) => {
    process.env.BASE_URL = value;
    expect(() => getBaseUrl()).toThrow();
  });
});
