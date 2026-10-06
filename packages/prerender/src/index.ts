/**
Simple pre-rendering approach based strongly upon
https://github.com/jacob-ebey/react-router-runtime-prerender

We generate requests, ask the server to "handle" them, and serialise the
response.

IMPORTANT DETAILS:  There are two tools at play here: Vite, and React
Router. Vite handles compilation and bundling, whilst React Router handles
routing. This means that, thankfully, most of the hard work is done by
Vite.

This package is designed to be consumed by a compiled NodeJS application.
The compiled application, when run, should fetch CDN content and render it
to HTML. We will refer to two phases: "compile time" and "render time".

To use this tool, Vite MUST be configured to use a relative base URL `./`.
One must use an absolute Vite base URL in dev mode, because React Router's
dev plugin expects it and will loudly error if this is not the case. But,
in production builds (like this renderer) we *can* use a relative URL. In
fact, we *need* to use a relative URL, because we are relocating assets
between compile time and render time.  We cannot use a relative base URL in
prod non-SSG builds, as will be explored later.

ASIDE:  Most of the time, Vite does not care about the base URL e.g.
loading inter-chunk data. However, there are places where the value of the
`vite.base` base URL is taken into account: HTML generation (including
`<links>` that contain URLs i.e. `import "./foo.css?url"`), and dynamic
loaded modules e.g. `import()` statements that remain in the bundle.
Choosing a non-relative `./` value would require us to fix-up generated
HTML and dynamic import statements after-the-fact (text-file replacement),
or to use a Vite experimental feature to define a JS string that evaluates
to the base URL at runtime. Both of these options are suboptimal.

As outlined above, most of the page rendering itself is handled by Vite.
This can cause problems when Vite and React Router do not communicate
exhaustively. For example, whilst Vite can use a relative base URL in HTML
strings, such as `<links>` components, React Router does not provide the
context about where the _page_ is, so these HTML relative links are often
broken (e.g. `page.html` vs `page/index.html`).

For this reason, we want to avoid base URL management at the Vite level,
and instead rely on the React Router management of base URLs (that we
already are required to deal with). For HTML generation, we must either set
the experimental hook, or avoid generating HTML altogether e.g replace
`<links>` that rely on `import "./foo.css?url"` with `import "./foo.css"`
(side-effect) that JustWorks™ because it spits out an `Asset` entry in the
build that we can modify.

Thus, by configuring Vite to use `base: './'` *only* for (production) HTML
builds (this pathway), and relying *only* on asset generation, we only have
to remap React Router paths to the new base URL at render time.
*/
import { createHash } from 'node:crypto';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { createRequestHandler, type ServerBuild } from 'react-router';

import type { SiteManifest } from 'myst-config';
import {
  getLinkBaseURL,
  normalizeBaseURL,
  RELATIVE_BASE_URL_PLACEHOLDER,
} from '@myst-theme/common';

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
 * Change from a slug such as `folder.subfolder.index` to a URL (`folder/subfolder`).
 *
 * @param slug
 * @returns url
 */
function slugToUrl(slug: string | null) {
  if (slug == null) return undefined;
  return slug.replace(/\.index$/, '').replace(/\./g, '/');
}
/**
 * Fetch items from the CDN.
 *
 * Generate RenderItem entries that correspond to HTML (pages) and
 * resources (page.json entries)
 */
async function getCDNItems(
  cdnUrl: string,
): Promise<{ config: SiteManifest; items: RenderablePath[] }> {
  // Load site
  const [configResponse, publicResponse] = await Promise.all([
    fetch(`${cdnUrl}/config.json`),
    fetch(`${cdnUrl}/public.json`),
  ]);
  if (!configResponse.ok || !publicResponse.ok) {
    throw new Error('Responses from CDN were not OK!');
  }
  const config = (await configResponse.json()) as SiteManifest;
  const sitePublic = (await publicResponse.json()) as string[];

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
  return { config, items: makeRoutes(config) };
}

function stripViteBaseURL(url: string): string {
  const viteBaseUrl = './';
  if (!url.startsWith(viteBaseUrl)) {
    throw new Error(
      `Invalid Vite URL. Vite should be configured to run with \`base: "./"\`: ${url}`,
    );
  }
  return url.slice(viteBaseUrl.length);
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
    // FIXME: handle client loaders if we end up using them
  };
}

/**
 * Relative prefix from a file at `filePath` (relative to the site root) to the site root
 */
function relativePrefix(filePath: string, isDirectory: boolean): string {
  const parts = filePath.split('/').filter(Boolean);
  const depth = isDirectory ? parts.length : parts.length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

/**
 * Replace the relative base URL placeholder with a relative prefix such as `../../`
 */
function replaceRelativeBaseUrl(content: string, prefix: string): string {
  return content.replace(new RegExp(`${RELATIVE_BASE_URL_PLACEHOLDER}(/)?`, 'g'), (_, slash) =>
    slash ? prefix : prefix.slice(0, -1),
  );
}

const TEXT_CONTENT_TYPE = /^(text\/|application\/(json|xml|javascript))/;

async function rewriteAssets(
  build: ServerBuild,
  outPath: string,
  baseUrl: string,
  relativeUrls: boolean,
) {
  const originalAssets = build.assets;
  // Find write path for manifest
  // Allow vite to configure _assets path
  const [_, manifestPath] =
    stripViteBaseURL(originalAssets.url).match(/(.*\/)manifest[^/]+$/) ?? [];
  if (manifestPath === undefined) {
    throw new Error(`Unexpected form of assets URL: ${originalAssets.url}`);
  }

  // Remove existing manifest
  await fsp.rm(path.join(outPath, stripViteBaseURL(originalAssets.url)));
  const assets: typeof originalAssets = {
    ...originalAssets,
    entry: {
      module: replaceViteBaseURL(originalAssets.entry.module, baseUrl),
      imports: originalAssets.entry.imports.map((mod) => replaceViteBaseURL(mod, baseUrl)),
    },
    routes: Object.fromEntries(
      Object.entries(originalAssets.routes).map(([id, routeAssets]) => [
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

  // With relative URLs, modules need absolute URLs, because `import()` resolves relative to the
  // importing module. Stylesheet URLs must match the server-rendered page for hydration, so they
  // use the relative prefix of the page, which the router basename holds until the client entry runs.
  const manifestSource = relativeUrls
    ? `const rel=window.__reactRouterContext.basename,abs=new URL(rel,location.href).pathname;` +
      `const m=JSON.parse(${JSON.stringify(JSON.stringify(assets))}` +
      `.replaceAll(${JSON.stringify(`${RELATIVE_BASE_URL_PLACEHOLDER}/`)},abs));` +
      `Object.values(m.routes).forEach((r)=>{if(r?.css)r.css=r.css.map((u)=>rel+u.slice(abs.length));});` +
      `window.__reactRouterManifest=m;`
    : `window.__reactRouterManifest=${JSON.stringify(assets)};`;
  await fsp.writeFile(path.join(outPath, newAssetsPath), manifestSource, 'utf8');

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
  relativeUrls: boolean,
) {
  const prerenderPath =
    base_url !== '/'
      ? '/' + base_url.split('/').filter(Boolean).map(encodeURIComponent).join('/') + item.path
      : item.path;

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
      let content = await contentResponse.text();
      if (relativeUrls) {
        content = replaceRelativeBaseUrl(content, relativePrefix(prerenderPathNoBase, true));
      }

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
      let content: Uint8Array | string = new Uint8Array(await contentResponse.arrayBuffer());
      const contentType = contentResponse.headers.get('content-type') ?? '';
      if (relativeUrls && TEXT_CONTENT_TYPE.test(contentType)) {
        // URLs in a resource are relative to the resource itself
        content = replaceRelativeBaseUrl(
          new TextDecoder().decode(content),
          relativePrefix(prerenderPathNoBase, false),
        );
      }

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
      throw new Error(`Invalid pre-render item type ${item.type}`);
    }
  }
}

/*
 * Pre-render a MyST site post-compile into an HTML project
 *
 * Requires a running MyST content server
 */
export async function prerender(build: ServerBuild, outPath: string) {
  // In future, if we pre-render `.data` routes, we'll want to set
  // this so that we can pass the data into the headers of secondary
  // requests
  process.env.IS_RR_BUILD_REQUEST = 'yes';

  // Ensure that we have a proper CDN URL that *does not end with /*
  const cdnUrl = `${normalizeBaseURL(process.env.CONTENT_CDN ?? 'http://localhost:3100')}`;

  const intrinsicItems = Object.values(build.routes)
    .map(getRenderItem)
    .filter((item): item is NonNullable<typeof item> => !!item);
  const { config, items: cdnItems } = await getCDNItems(cdnUrl);
  const renderItems = [...intrinsicItems, ...cdnItems];

  // Relative URLs render links with a placeholder base URL, which each output file then replaces
  const relativeUrls = !!config.options?.relative_urls;
  // Ensure we have a proper base URL ending with /
  const baseUrl = `${getLinkBaseURL(process.env, { config, staticBuild: true })}/`;

  const assets = await rewriteAssets(build, outPath, baseUrl, relativeUrls);

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
    renderItems.map((item) => renderRenderablePath(handler, item, outPath, baseUrl, relativeUrls)),
  );
}
