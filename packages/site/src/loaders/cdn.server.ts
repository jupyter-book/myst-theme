import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import type { SiteManifest as Config } from '@curvenote/site-common';
import { responseNoArticle, responseNoSite } from './errors.server';
import {
  getFooterLinks,
  getProject,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
} from './utils';
import { redirect } from '@remix-run/node';
import type { PageLoader } from '../types';

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

/**
 * If the site title and the first nav item are the same, remove it.
 */
function removeSingleNavItems(config: Config) {
  if (config?.nav?.length === 1 && config.nav[0].title === config.title) {
    config.nav = [];
  }
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
  removeSingleNavItems(data);
  updateSiteManifestStaticLinksInplace(data, (url) => withCDN(id, url));
  getConfigCache().set<Config>(id, data);
  return data;
}

export async function getObjectsInv(hostname: string): Promise<Buffer | undefined> {
  const id = await getCdnPath(hostname);
  if (!id) return;
  const url = `${CDN}${id}/objects.inv`;
  const response = await fetch(url);
  if (response.status === 404) return;
  const buffer = await response.buffer();
  return buffer;
}

export async function getData(
  config?: Config,
  project?: string,
  slug?: string,
): Promise<PageLoader | null> {
  if (!project || !slug || !config) throw responseNoArticle();
  const { id } = config;
  if (!id) throw responseNoSite();
  const response = await fetch(`${CDN}${id}/content/${project}/${slug}.json`);
  if (response.status === 404) throw responseNoArticle();
  const data = (await response.json()) as PageLoader;
  return updatePageStaticLinksInplace(data, (url) => withCDN(id, url));
}

export async function getPage(
  hostname: string,
  opts: {
    domain?: string;
    project?: string;
    loadIndexPage?: boolean;
    slug?: string;
    redirect?: boolean | string;
  },
): Promise<PageLoader | Response | null> {
  const projectName = opts.project;
  const config = await getConfig(hostname);
  if (!config) throw responseNoSite();
  const project = getProject(config, projectName);
  if (!project) throw responseNoArticle();
  if (opts.slug === project.index && opts.redirect) {
    return redirect(`${typeof opts.redirect === 'string' ? opts.redirect : '/'}${projectName}`);
  }
  const slug = opts.loadIndexPage || opts.slug == null ? project.index : opts.slug;
  const loader = await getData(config, projectName, slug).catch((e) => {
    console.error(e);
    return null;
  });
  if (!loader) throw responseNoArticle();
  const footer = getFooterLinks(config, projectName, slug);
  return { ...loader, footer, domain: opts.domain as string };
}
