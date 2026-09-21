import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SiteManifest } from 'myst-config';
import { createRobotsTxt } from './seo/robots.js';
import { createSitemap } from './seo/sitemap.js';
import { getBaseUrl, getSiteUrl } from './utils.js';

const request = new Request('http://localhost:3000/page');

function clearDeploymentEnvironment() {
  delete process.env.BASE_URL;
  delete process.env.READTHEDOCS_CANONICAL_URL;
}

beforeEach(clearDeploymentEnvironment);
afterEach(clearDeploymentEnvironment);

describe('theme site URLs', () => {
  it('falls back to the request origin without public URL configuration', () => {
    expect(getSiteUrl(request)).toBe('http://localhost:3000');
  });

  it('combines the request origin with the deployment base path', () => {
    process.env.BASE_URL = '/repository';
    expect(getSiteUrl(request)).toBe('http://localhost:3000/repository');
  });

  it('does not treat deployment domain aliases as the public site URL', () => {
    expect(getSiteUrl(request, { domains: ['example.org'] } as SiteManifest)).toBe(
      'http://localhost:3000',
    );
  });

  it('uses an absolute BASE_URL for sitemap, stylesheet, and robots URLs', () => {
    process.env.BASE_URL = 'https://example.org/docs/';
    const siteUrl = getSiteUrl(request);
    expect(getBaseUrl()).toBe('/docs');
    const sitemap = createSitemap(siteUrl, ['/page']);
    const robots = createRobotsTxt(siteUrl);
    expect(sitemap).toContain('<loc>https://example.org/docs/page</loc>');
    expect(sitemap).toContain('href="https://example.org/docs/sitemap_style.xsl"');
    expect(robots).toContain('Sitemap: https://example.org/docs/sitemap.xml');
    expect(`${sitemap}\n${robots}`).not.toContain('localhost');
  });

  it.each([
    'ftp://example.org',
    'https://example.org/docs?preview=true',
    'https://example.org/docs#section',
  ])('rejects invalid public BASE_URL values: %s', (baseUrl) => {
    process.env.BASE_URL = baseUrl;
    expect(() => getSiteUrl(request)).toThrow(/BASE_URL/);
  });
});
