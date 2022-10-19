import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import type { PageLoader as Data, SiteManifest as Config } from '@curvenote/site-common';
import { responseNoArticle, responseNoSite } from './errors.server';
import {
  getFooterLinks,
  getProject,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
} from './utils';
import { redirect } from '@remix-run/node';

interface CdnRouter {
  cdn?: string;
}

declare global {
  // Disable multiple caches when this file is rebuilt
  // eslint-disable-next-line
  var cdnRouterCache: NodeCache | undefined, configCache: NodeCache | undefined;
}

const CDN = 'https://cdn.curvenote.com/';

function getCdnRouterCache() {
  if (global.cdnRouterCache) return global.cdnRouterCache;
  console.log('Creating cdnRouterCache');
  // The router should update every minute
  global.cdnRouterCache = new NodeCache({ stdTTL: 30 });
  return global.cdnRouterCache;
}

function getConfigCache() {
  if (global.configCache) return global.configCache;
  console.log('Creating configCache');
  // The config can be long lived as it is static (0 == ∞)
  global.configCache = new NodeCache({ stdTTL: 0 });
  return global.configCache;
}

async function getCdnPath(hostname: string): Promise<string | undefined> {
  const cached = getCdnRouterCache().get<CdnRouter>(hostname);
  if (cached) return cached.cdn;
  const response = await fetch(`https://api.curvenote.com/routers/${hostname}`);
  if (response.status === 404) {
    // Always hit the API again if it is not found!
    return;
  }
  const data = (await response.json()) as CdnRouter;
  getCdnRouterCache().set<CdnRouter>(hostname, data);
  return data.cdn;
}

function withCDN<T extends string | undefined>(id: string, url: T): T {
  if (!url) return url;
  return `${CDN}${id}/public${url}` as T;
}

export async function getConfig(hostname: string): Promise<Config> {
  const id = await getCdnPath(hostname);
  if (!id) throw responseNoSite();
  const cached = getConfigCache().get<Config>(id);
  // Load the data from an in memory cache.
  if (cached) return cached;
  const response = await fetch(`${CDN}${id}/config.json`);
  if (response.status === 404) throw responseNoSite();
  const data = (await response.json()) as Config;
  data.id = id;
  updateSiteManifestStaticLinksInplace(data, (url) => withCDN(id, url));
  getConfigCache().set<Config>(id, data);
  return data;
}

export async function getObjectsInv(hostname: string): Promise<ArrayBuffer | undefined> {
  const id = await getCdnPath(hostname);
  if (!id) return;
  const url = `${CDN}${id}/public/_static/objects.inv`;
  const response = await fetch(url);
  if (response.status === 404) return;
  const buffer = await response.arrayBuffer();
  return buffer;
}

export async function getData(
  config?: Config,
  project?: string,
  slug?: string,
): Promise<Data | null> {
  if (!project || !slug || !config) throw responseNoArticle();
  const { id } = config;
  if (!id) throw responseNoSite();
  const response = await fetch(`${CDN}${id}/content/${project}/${slug}.json`);
  if (response.status === 404) throw responseNoArticle();
  const data = (await response.json()) as Data;
  return updatePageStaticLinksInplace(data, (url) => withCDN(id, url));
}

export async function getPage(
  hostname: string,
  opts: { domain?: string; folder?: string; loadIndexPage?: boolean; slug?: string },
) {
  const folderName = opts.folder;
  const config = await getConfig(hostname);
  if (!config) throw responseNoSite();
  const folder = getProject(config, folderName);
  if (!folder) throw responseNoArticle();
  if (opts.slug === folder.index) {
    return redirect(`/${folderName}`);
  }
  const slug = opts.loadIndexPage ? folder.index : opts.slug;
  const loader = await getData(config, folderName, slug).catch((e) => {
    console.error(e);
    return null;
  });
  if (!loader) throw responseNoArticle();
  const footer = getFooterLinks(config, folderName, slug);
  return { ...loader, footer, domain: opts.domain };
}
