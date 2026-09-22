/**
 * Simple pre-rendering approach based strongly upon https://github.com/jacob-ebey/react-router-runtime-prerender
 *
 * We generate requests, ask the server to "handle" them, and serialise the response.
 *
 * IMPORTANT DETAILS:  There are two tools at play here: Vite, and React
 * Router. Vite handles compilation and bundling, whilst React Router handles
 * routing. This means that, thankfully, most of the hard work is done by
 * Vite.
 *
 * This package is designed to be consumed by a compiled NodeJS application.
 * This compiled application, when run, should fetch CDN content and render it
 * to HTML. We will refer to two phases: "compile time" and "render time".
 *
 * To use this tool, Vite MUST be configured to use a relative base URL `./`.
 * One must use an absolute Vite base URL in dev mode, because React Router's
 * dev plugin expects it and will loudly error if this is not the case. But,
 * in production builds (like this renderer) we *can* use a relative URL. In
 * fact, we *need* to use a relative URL, because we are relocating assets
 * between compile time and render time.  We cannot use a relative base URL in
 * prod non-SSG builds, as will be explored later.
 *
 * ASIDE:  Most of the time, Vite uses relative URLs when e.g. loading
 * inter-chunk data. However, there are places where the value of an absolute
 * base URL is taken into account: HTML generation (including `<links>` that
 * contain URLs i.e. `import "./foo.css?url"`), and dynamic loaded modules
 * e.g. `import()` statements that remain in the bundle. For dynamic modules,
 * we can set a special experimental hook to dynamically compute the base URL
 * at runtime, _or_ we can just set Vite's `base` to './'. For HTML
 * generation, we must either set the experimental hook, or avoid generating
 * HTML altogether e.g replace `<links>` with `import "./foo.css?url"` that
 * JustWorks™ because it spits out an `Asset` entry in the build. Meanwhile,
 * relative asset URLs do not work in React Router builds when e.g. there are
 * non top-level HTML files. In general, React Router does not like relative
 * base URLs.
 *
 * Thus, by configuring Vite to use `base: './'` *only* for (production) HTML
 * builds (this pathway), and relying *only* on asset generation, we only have
 * to remap React Router paths to the new base URL at render time.
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

type RenderablePath = {
  path: string;
  type: 'resource' | 'html';
};

type BuildRoutes = ServerBuild['routes'];
type BuildRoute = NonNullable<BuildRoutes[keyof BuildRoutes]>;

type AssetRoutes = ServerBuild['assets']['routes'];
type EntryRoute = NonNullable<AssetRoutes[keyof AssetRoutes]>;

/**
 * Generate details about a server pathway to render from a manifest route
 *
 * This function provides additional context about non-dynamic routes to
 * determine whether they're for HTML or resources. We only handle non-dynamic
 * routes here, because they're a property of the theme itself.
 * */
function getRenderItem(route: BuildRoute | undefined): RenderablePath | undefined {
  if (route === undefined) {
    return undefined;
  }
  if (route.id == 'root') {
    return undefined;
  }
  const routePath = (route as any).path as string | undefined;
  const isResourceRoute = !(route as any).module.default;

  if (isResourceRoute) {
    if (routePath === undefined) {
      throw new Error('Route does not have path, unexpected!');
    } else if (isDynamicRoute(routePath)) {
      return undefined;
    } else {
      return { path: `/${routePath}`, type: 'resource' } satisfies RenderablePath;
    }
  } else {
    if (routePath == undefined && route.index) {
      return { path: '/', type: 'html' } satisfies RenderablePath;
    } else if (routePath === undefined) {
      throw new Error('Route does not have path, unexpected!');
    } else if (isDynamicRoute(routePath)) {
      return undefined;
    } else {
      return { path: `/${routePath}/`, type: 'html' } satisfies RenderablePath;
    }
  }
}

type Page = NonNullable<SiteManifest['projects']>[number]['pages'][number];

/**
 * Fetch items from the CDN.
 *
 * Generate RenderItem entries that correspond to HTML (pages) and
 * resources (page.json entries)
 */
async function getCDNItems(cdnUrl: string): Promise<RenderablePath[]> {
  // Load site
  const [configResponse, publicResponse] = await Promise.all([
    fetch(`${cdnUrl}/config.json`),
    fetch(`${cdnUrl}/public.json`),
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
      { path: '/', type: 'html' } satisfies RenderablePath,
      ...pages.map((page) => {
        const pathSubPath = slugToUrl(page.slug);
        return {
          path: `/${pathSubPath}/`,
          type: 'html',
        } satisfies RenderablePath;
      }),
      // Download all of the configured JSON
      {
        path: `/${localProj.index}.json`,
        type: 'resource',
      } satisfies RenderablePath,
      ...pages.map((page) => {
        return {
          path: `/${page.slug}.json`,
          type: 'resource',
        } satisfies RenderablePath;
      }),
      ...sitePublic.map((publicPath) => {
        return {
          path: `/_public${publicPath}`,
          type: 'resource',
        } satisfies RenderablePath;
      }),
    ].flat();
  };
  return makeRoutes(config);
}

function stripViteBaseURL(url: string): string {
  if (!url.startsWith('./')) {
    throw new Error(
      `Invalid Vite URL. Vite should be configured to run with \`base: "./"\`: ${url}`,
    );
  }
  return url.slice(2);
}

function replaceViteBaseURL(url: string, baseUrl: string) {
  return baseUrl + stripViteBaseURL(url);
}

function rewriteRouteAsset(asset: EntryRoute, baseUrl: string): EntryRoute {
  return {
    ...asset,
    module: asset.module ? replaceViteBaseURL(asset.module, baseUrl) : asset.module,
    imports: asset.imports?.map((mod) => replaceViteBaseURL(mod, baseUrl)),
    css: asset.css?.map((mod) => replaceViteBaseURL(mod, baseUrl)),
  };
}

async function rewriteAssets(build: ServerBuild, outPath: string, baseUrl: string) {
  // Find write path for manifest
  // Allow vite to configure _assets path
  const [_, manifestPath] = build.assets.url.match(/(.*\/)manifest[^/]+$/) ?? [];
  if (manifestPath === undefined) {
    throw new Error(`Unexpected form of assets URL: ${build.assets.url}`);
  }

  // Remove existing manifest
  await fsp.rm(path.join(outPath, stripViteBaseURL(build.assets.url)));
  const assets: typeof build.assets = {
    ...build.assets,
    entry: {
      module: replaceViteBaseURL(build.assets.entry.module, baseUrl),
      imports: build.assets.entry.imports.map((mod) => replaceViteBaseURL(mod, baseUrl)),
    },
    routes: Object.fromEntries(
      Object.entries(build.assets.routes).map(([id, routeAssets]) => [
        id,
        routeAssets ? rewriteRouteAsset(routeAssets, baseUrl) : routeAssets,
      ]),
    ),
  };
  // This version string just needs to be unique
  const version = createHash('sha256').update(JSON.stringify(assets)).digest('base64url');

  const newAssetsPath = `${manifestPath}manifest-${version}.js`;
  assets.url = `${baseUrl}${newAssetsPath}`;
  assets.version = version;

  await fsp.writeFile(
    path.join(outPath, newAssetsPath),
    `window.__reactRouterManifest=${JSON.stringify(assets)};`,
    'utf8',
  );

  return assets;
}

/**
 * Render a renderable path (e.g. /index) into HTML or other file types
 */
async function renderRenderablePath(
  handler: ReturnType<typeof createRequestHandler>,
  item: RenderablePath,
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
}

/*
 * Pre-render a MyST site post-compile into an HTML project
 *
 * Requires a running MyST content server
 */
export async function prerender(build: ServerBuild, outPath: string) {
  process.env.IS_RR_BUILD_REQUEST = 'yes';

  const baseUrl = process.env.BASE_URL ?? '/';

  const cdnUrl = process.env.CONTENT_CDN;
  if (cdnUrl === undefined) {
    throw new Error('Expected CONTENT_CDN');
  }

  const intrinsicItems = Object.values(build.routes)
    .map(getRenderItem)
    .filter((item): item is NonNullable<typeof item> => !!item);
  const cdnItems = await getCDNItems(cdnUrl);
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

  await Promise.all(
    renderItems.map((item) => renderRenderablePath(handler, item, outPath, baseUrl)),
  );
}
