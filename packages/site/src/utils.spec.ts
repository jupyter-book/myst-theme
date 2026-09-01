import { afterEach, describe, expect, it } from 'vitest';
import type { SiteManifest } from 'myst-config';
import { createRobotsTxt } from './seo/robots.js';
import { createSitemap } from './seo/sitemap.js';
import { getCanonicalSiteUrl, normalizeCanonicalUrl } from './utils.js';

const request = new Request('http://localhost:3000/page');
const config = (canonical_url?: string) =>
  ({ canonical_url }) as SiteManifest & {
    canonical_url?: string;
  };

afterEach(() => {
  delete process.env.SITE_URL;
  delete process.env.BASE_URL;
  delete process.env.READTHEDOCS_CANONICAL_URL;
});

describe('getCanonicalSiteUrl', () => {
  it('uses SITE_URL with highest precedence and normalizes its trailing slash', () => {
    process.env.SITE_URL = 'https://deploy.example.org/docs/';
    process.env.READTHEDOCS_CANONICAL_URL = 'https://rtd.example.org/project/';
    expect(getCanonicalSiteUrl(request, config('https://config.example.org/'))).toBe(
      'https://deploy.example.org/docs',
    );
  });

  it('uses site.canonical_url before Read the Docs', () => {
    process.env.READTHEDOCS_CANONICAL_URL = 'https://rtd.example.org/project/';
    expect(getCanonicalSiteUrl(request, config('https://config.example.org/docs/'))).toBe(
      'https://config.example.org/docs',
    );
  });

  it('preserves the full Read the Docs canonical URL', () => {
    process.env.READTHEDOCS_CANONICAL_URL = 'https://docs.example.org/en/latest/';
    expect(getCanonicalSiteUrl(request)).toBe('https://docs.example.org/en/latest');
  });

  it('falls back to the request origin and BASE_URL', () => {
    process.env.BASE_URL = '/repository/';
    expect(getCanonicalSiteUrl(request)).toBe('http://localhost:3000/repository');
  });

  it('produces complete SEO URLs for a subpath deployment', () => {
    process.env.SITE_URL = 'https://example.org/docs';
    const siteUrl = getCanonicalSiteUrl(request);
    const sitemap = createSitemap(siteUrl, ['/page']);
    const robots = createRobotsTxt(siteUrl);
    expect(sitemap).toContain('<loc>https://example.org/docs/page</loc>');
    expect(sitemap).toContain('href="https://example.org/docs/sitemap_style.xsl"');
    expect(robots).toContain('Sitemap: https://example.org/docs/sitemap.xml');
    expect(`${sitemap}\n${robots}`).not.toContain('localhost');
  });

  it('does not infer a URL from domains', () => {
    expect(getCanonicalSiteUrl(request, { domains: ['example.org'] } as SiteManifest)).toBe(
      'http://localhost:3000',
    );
  });
});

describe('normalizeCanonicalUrl', () => {
  it.each([
    'example.org',
    '/docs',
    'ftp://example.org',
    'https://example.org?q=1',
    'https://example.org#docs',
  ])('rejects %s', (value) => expect(() => normalizeCanonicalUrl(value)).toThrow());
});
