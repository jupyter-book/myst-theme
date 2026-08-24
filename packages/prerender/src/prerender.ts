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
  const config: SiteManifest = await fetch(`${cdn}/config.json`).then((r) => r.json());
  const sitePublic: string[] = await fetch(`${cdn}/public.json`).then((r) => r.json());

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

    const localProjSlug = localProj.slug ? `/${localProj.slug}` : '';
    if (localProjSlug) {
      throw new Error();
    }
    const makePath = (path: string) => path;
    // We need to get the index from a slug page to make remix happy
    // If this gets from the index, then the site will trigger the wrong render path
    // And then hydration does not match
    const siteIndex = baseurl ? `/${localProj.index}` : '';
    const pages = localProj.pages.filter((page: any): page is Page => !!(page as any).slug);
    return [
      { url: `${localProjSlug}${siteIndex}`, path: makePath('index.html') },
      ...pages.map((page: Page) => {
        const pathSubPath = slugToUrl(page.slug);
        return {
          url: `${localProjSlug}/${pathSubPath}`,
          path: makePath(`${pathSubPath}/index.html`),
        };
      }),
      // Download all of the configured JSON
      {
        url: `${localProjSlug}/${localProj.index}.json`,
        path: makePath(`${localProj.index}.json`),
      },
      ...pages.map((page: Page) => {
        return {
          url: `${localProjSlug}/${page.slug}.json`,
          path: makePath(`${page.slug}.json`),
        };
      }),
      ...sitePublic.map((path: string) => {
        return {
          url: `/_static${path}`,
          path: makePath(`_static${path}`),
        };
      }),
    ].flat();
  };
  return [...makeRoutes(config).map((r) => (r.url ? r.url : '/')), ...getStaticPaths()];
}
