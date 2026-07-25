import type { Config } from '@react-router/dev/config';

const CONTENT_CDN = process.env.CONTENT_CDN;
if (CONTENT_CDN === undefined) {
  throw new Error('Expected CONTENT_CDN');
}
process.env.MODE = 'static';

const response = await fetch(`${CONTENT_CDN}/config.json`);
const config = await response.json();

/**
 * Change from a slug such as `folder.subfolder.index` to a URL (`folder/subfolder`).
 *
 * @param slug
 * @returns url
 */
function slugToUrl<T extends string | undefined>(slug: T): T {
  if (slug == null) return undefined as T;
  return slug.replace(/\.index$/, '').replace(/\./g, '/') as T;
}

interface Page {
  slug: string;
}

function makeRoutes(data: any) {
  const localProj = data.projects[0];
  const baseurl = '';
  const host = '';

  const localProjSlug = localProj.slug ? `/${localProj.slug}` : '';
  if (localProjSlug) {
    throw new Error();
  }
  const makePath = (path: string) => path;
  // We need to get the index from a slug page to make remix happy
  // If this gets from the index, then the site will trigger the wrong render path
  // And then hydration does not match
  const siteIndex = baseurl ? `/${localProj.index}` : '';
  const pages = localProj.pages.filter((page): page is Page => !!(page as any).slug);
  return [
    { url: `${host}${localProjSlug}${siteIndex}`, path: makePath('index.html') },
    ...pages.map((page) => {
      const pathSubPath = slugToUrl(page.slug);
      return {
        url: `${host}${localProjSlug}/${pathSubPath}`,
        path: makePath(`${pathSubPath}/index.html`),
      };
    }),
    // Download all of the configured JSON
    {
      url: `${host}${localProjSlug}/${localProj.index}.json`,
      path: makePath(`${localProj.index}.json`),
    },
    ...pages.map((page) => {
      return {
        url: `${host}${localProjSlug}/${page.slug}.json`,
        path: makePath(`${page.slug}.json`),
      };
    }),
    // Download other assets
    ...['myst.search.json', 'myst.xref.json'].map((asset) => ({
      url: `${host}/${asset}`,
      path: asset,
    })),
  ].flat();
}
export default {
  ssr: false,
  basename: process.env.BASE_URL ?? '/',
  async prerender({ getStaticPaths }) {
    return [...makeRoutes(config).map((r) => (r.url ? r.url : '/')), ...getStaticPaths()];
  },
  future: {
    v8_passThroughRequests: true,
    v8_middleware: true,
    v8_splitRouteModules: 'enforce',
    v8_viteEnvironmentApi: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
