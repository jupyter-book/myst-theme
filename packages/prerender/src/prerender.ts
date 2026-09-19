import type { SiteManifest } from 'myst-config';

interface Page {
  slug: string;
}

export async function prerender({ getStaticPaths }: { getStaticPaths: () => string[] }) {
  const cdn = process.env.CONTENT_CDN;
  if (cdn === undefined) {
    throw new Error('Expected CONTENT_CDN');
  }

  // Load site
  const [configResponse, publicResponse] = await Promise.all([
    fetch(`${cdn}/config.json`),
    fetch(`${cdn}/public.json`),
  ]);
  const config = (await configResponse.json()) as SiteManifest;
  const sitePublic = (await publicResponse.json()) as string[];

  /**
   * Change from a slug such as `folder.subfolder.index` to a URL (`folder/subfolder`).
   *
   * @param slug
   * @returns url
   */
  const slugToUrl = (slug: string | null) => {
    if (slug == null) return undefined;
    return slug.replace(/\.index$/, '').replace(/\./g, '/');
  };

  const makeRoutes = (data: any) => {
    const localProj = data.projects[0];
    const baseurl = '';

    const makePath = (path: string) => path;
    // We need to get the index from a slug page to make remix happy
    // If this gets from the index, then the site will trigger the wrong render path
    // And then hydration does not match
    const siteIndex = baseurl ? `/${localProj.index}` : '';
    const pages = localProj.pages.filter((page: any): page is Page => !!(page as any).slug);
    return [
      { url: '/', path: makePath('index.html') },
      ...pages.map((page: Page) => {
        const pathSubPath = slugToUrl(page.slug);
        return {
          url: `/${pathSubPath}`,
          path: makePath(`${pathSubPath}/index.html`),
        };
      }),
      // Download all of the configured JSON
      {
        url: `/${localProj.index}.json`,
        path: makePath(`${localProj.index}.json`),
      },
      ...pages.map((page: Page) => {
        return {
          url: `/${page.slug}.json`,
          path: makePath(`${page.slug}.json`),
        };
      }),
      ...sitePublic.map((path: string) => {
        return {
          url: `/build${path}`,
          path: makePath(`build${path}`),
        };
      }),
    ].flat();
  };
  return [...makeRoutes(config).map((r) => (r.url ? r.url : '/')), ...getStaticPaths()];
}
