import type { Config } from '@react-router/dev/config';

import { rename, readdir, mkdir, rm, stat } from 'node:fs/promises';
import { createWriteStream} from 'node:fs';
import { relative, join ,dirname} from 'node:path';
import { Readable } from 'node:stream'

// Inputs
const CONTENT_CDN = process.env.CONTENT_CDN;
if (CONTENT_CDN === undefined) {
  throw new Error('Expected CONTENT_CDN');
}
const BUILD_DIRECTORY = process.env.BUILD_DIRECTORY;
if (BUILD_DIRECTORY === undefined) {
  throw new Error('Expected BUILD_DIRECTORY');
}
const BASE_URL = process.env.BASE_URL ?? '/';

process.env.MODE = 'static';

// Load site
const [config, sitePublic] = await Promise.all([
  fetch(`${CONTENT_CDN}/config.json`).then((r) => r.json()),
  fetch(`${CONTENT_CDN}/public.json`).then((r) => r.json()),
]);

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
    ...sitePublic.map((path) => {
      return {
        url: `${host}/_static${path}`,
        path: makePath(`_static${path}`),
      };
    }),
  ].flat();
}

async function fetchAsset(asset: string, assetsPath: string) {
  const assetPath = asset.slice(1);
  const url = `${CONTENT_CDN}/${assetPath}`;
  const resp = await fetch(url);
  const filename = join(assetsPath, assetPath);

  const dirPath = dirname(filename)
  if ((await stat(dirPath, {throwIfNoEntry: false})) === undefined) {    await mkdir(dirPath, { recursive: true });
  }
  return new Promise<void>(async (resolve, reject) => {
    const fileWriteStream = createWriteStream(filename);
    Readable.fromWeb(resp.body!).pipe(fileWriteStream);
    fileWriteStream.on('error', reject);
    fileWriteStream.on('finish', resolve);
  });
}

export default {
  ssr: false,
  basename: BASE_URL,
  async prerender({ getStaticPaths }) {
    return [...makeRoutes(config).map((r) => (r.url ? r.url : '/')), ...getStaticPaths()];
  },
  async buildEnd({ reactRouterConfig }) {
    const buildRoot = join(reactRouterConfig.buildDirectory, 'client');
    // Lift files under <BASE_URL> to the root of the build buildDirectory
    // This is an annoying react-router bug
    if (BASE_URL !== '/') {
      const contentRoot = `${buildRoot}${BASE_URL}`;

      // Move files under build
      for (const ent of await readdir(contentRoot, { recursive: true, withFileTypes: true })) {
        const filePath = join(ent.path, ent.name);
        const newFilePath = join(buildRoot, relative(contentRoot, filePath));

        if (ent.isDirectory()) {
          await mkdir(newFilePath);
        } else {
          await rename(filePath, newFilePath);
        }
      }
      // Clean up by removing the base-URL directory.
      await rm(contentRoot, { recursive: true, force: true });
    }
    // Populate static media
    const assetsRoot = join(buildRoot, 'build');
    // Move build directory to expected location
    // We cannot just set the buildDirectory react-router config, as it breaks prerendering
    await rm(BUILD_DIRECTORY, { recursive: true, force: true });
    await rename(buildRoot, BUILD_DIRECTORY);
  }
} satisfies Config;
