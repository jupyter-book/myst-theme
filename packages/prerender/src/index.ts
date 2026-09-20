/**
 * Simple pre-rendering approach based strongly upon https://github.com/jacob-ebey/react-router-runtime-prerender
 *
 * We generate requests, ask the server to "handle" them, and serialise the respone
 */
import { createHash } from 'node:crypto';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { createRequestHandler, type ServerBuild } from 'react-router';

import type { SiteManifest } from 'myst-config';

function isDynamicRoute(urlPath: string): boolean {
  const segments = urlPath.split('/');
  return segments.some((s) => s.startsWith(':') || s === '*');
}

type RenderItem = {
  path: string;
  type: 'resource' | 'html';
};

type BuildRoutes = ServerBuild['routes'];
type BuildRoute = NonNullable<BuildRoutes[keyof BuildRoutes]>;

function getRenderItem(route: BuildRoute | undefined): RenderItem | undefined {
  if (route === undefined) {
    return undefined;
  }
  if (route.id == 'root') {
    return undefined;
  }
  const routePath = (route as any).path as string | undefined;
  const isResourceRoute = !(route as any).module.default;
  console.log(route);
  if (isResourceRoute) {
    if (routePath === undefined) {
      throw new Error();
    } else if (isDynamicRoute(routePath)) {
      return undefined;
    } else {
      return { path: `/${routePath}`, type: 'resource' } satisfies RenderItem;
    }
  } else {
    if (routePath == undefined && route.index) {
      return { path: '/', type: 'html' } satisfies RenderItem;
    } else if (routePath === undefined) {
      throw new Error();
    } else if (isDynamicRoute(routePath)) {
      return undefined;
    } else {
      return { path: `/${routePath}/`, type: 'html' } satisfies RenderItem;
    }
  }
}

type Page = NonNullable<SiteManifest['projects']>[number]['pages'][number];

/**
 * Fetch items from the CDN
 */
async function getCDNItems(): Promise<RenderItem[]> {
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

  const makeRoutes = (data: SiteManifest) => {
    const localProj = data.projects?.[0];
    if (localProj === undefined) {
      throw new Error('Expected at least one project');
    }

    // We need to get the index from a slug page to make remix happy
    // If this gets from the index, then the site will trigger the wrong render path
    // And then hydration does not match
    const pages = localProj.pages.filter((page): page is Page & { slug: string } => !!page.slug);
    return [
      { path: '/', type: 'html' } satisfies RenderItem,
      ...pages.map((page) => {
        const pathSubPath = slugToUrl(page.slug);
        return {
          path: `/${pathSubPath}/`,
          type: 'html',
        } satisfies RenderItem;
      }),
      // Download all of the configured JSON
      {
        path: `/${localProj.index}.json`,
        type: 'resource',
      } satisfies RenderItem,
      ...pages.map((page) => {
        return {
          path: `/${page.slug}.json`,
          type: 'resource',
        } satisfies RenderItem;
      }),
      ...sitePublic.map((publicPath) => {
        return {
          path: `/build${publicPath}`,
          type: 'resource',
        } satisfies RenderItem;
      }),
    ].flat();
  };
  return makeRoutes(config);
}

interface Asset {
  imports?: string[];
  module?: string;
  css?: string[];
}

function rewriteAsset<T extends Asset>(asset: T, baseUrl: string): T {
  if (baseUrl === '/') return asset;
  return {
    ...asset,
    module: asset.module ? baseUrl + asset.module.slice(1) : asset.module,
    imports: asset.imports?.map((mod) => baseUrl + mod.slice(1)),
    css: asset.css?.map((mod) => baseUrl + mod.slice(1)),
  };
}

async function rewriteAssets(build: ServerBuild, outPath: string, baseUrl: string) {
  if (baseUrl === '/') {
    return build.assets;
  }
  // Remove existing manifest
  await fsp.rm(path.join(outPath, build.assets.url.slice(1)));
  const assets: typeof build.assets = {
    ...build.assets,
    url: '<invalid>',
    version: '<invalid>',
    // base: BASE_URL, don't keep this, stick to upstream types -- its namespaced so no hash collision
    entry: rewriteAsset(build.assets.entry, baseUrl),
    routes: Object.fromEntries(
      Object.entries(build.assets.routes).map(([id, routeAssets]) => [
        id,
        routeAssets ? rewriteAsset(routeAssets, baseUrl) : routeAssets,
      ]),
    ),
  };
  const version = createHash('sha256').update(JSON.stringify(assets)).digest('base64url');

  assets.url = `${baseUrl}assets/manifest-${version}.js`;
  assets.version = version;

  await fsp.writeFile(
    path.join(outPath, assets.url.slice(baseUrl.length)),
    `window.__reactRouterManifest=${JSON.stringify(assets)};`,
    'utf8',
  );

  return assets;
}

async function renderItem(
  handler: ReturnType<typeof createRequestHandler>,
  item: RenderItem,
  out_path: string,
  base_url: string,
) {
  const prerenderPath =
    base_url !== '/' ? '/' + base_url.split('/').filter(Boolean).join('/') + item.path : item.path;

  const contentURL = new URL(prerenderPath, 'http://pre.render');
  const contentResponse = await handler(new Request(contentURL));

  if (!contentResponse.ok) {
    throw new Error(
      `Invalid response for ${item.type} route ${prerenderPath}: ${contentResponse.status}`,
    );
  }

  const prerenderPathNoBase = prerenderPath.slice(base_url.length);

  switch (item.type) {
    case 'html': {
      const content = await contentResponse.text();

      const contentPath = path.resolve(
        path.join(out_path, ...(prerenderPathNoBase + '/index.html').split('/').filter(Boolean)),
      );
      // Create directory for /path/index.html
      await fsp.mkdir(path.dirname(contentPath), { recursive: true });

      // Write HTML, and possibly data
      await fsp.writeFile(contentPath, content, 'utf-8');
      break;
    }
    case 'resource': {
      const content = new Uint8Array(await contentResponse.arrayBuffer());

      const contentPath = path.resolve(
        path.join(out_path, ...prerenderPathNoBase.split('/').filter(Boolean)),
      );
      // Create directory for /path/index.html
      await fsp.mkdir(path.dirname(contentPath), { recursive: true });

      // Write HTML, and possibly data
      await fsp.writeFile(contentPath, content, 'utf-8');
      break;
    }
    default: {
      throw new Error();
    }
  }

  // Write to disk
}

export async function prerender(build: ServerBuild, outPath: string) {
  process.env.IS_RR_BUILD_REQUEST = 'yes';

  const baseUrl = process.env.BASE_URL ?? '/';

  const intrinsicItems = Object.values(build.routes)
    .map(getRenderItem)
    .filter((item): item is NonNullable<typeof item> => !!item);
  const cdnItems = await getCDNItems();
  const renderItems = [...intrinsicItems, ...cdnItems];

  const assets = await rewriteAssets(build, outPath, baseUrl);

  const handler = createRequestHandler(
    {
      ...build,
      basename: baseUrl,
      publicPath: baseUrl,
      assets,
    },
    'production',
  );

  await Promise.all(renderItems.map((item) => renderItem(handler, item, outPath, baseUrl)));
}
