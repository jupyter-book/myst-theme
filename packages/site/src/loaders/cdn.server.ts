import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import type { SiteManifest } from 'myst-config';
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

export type Host = string | { CDN: string; id: string };

const DEFAULT_CDN = 'https://cdn.curvenote.com/';

function getCdnRouterCache() {
  if (global.cdnRouterCache) return global.cdnRouterCache;
  console.log('Creating cdnRouterCache');
  // The router should update every minute
  global.cdnRouterCache = new NodeCache({ stdTTL: 30 });
  return global.cdnRouterCache;
}

export function getConfigCache() {
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

function withPublicFolderUrl(baseUrl: string, url: string): string {
  return withBaseUrl(baseUrl, `public${url}`);
}

export async function getCdnLocation(host: Host) {
  if (typeof host === 'string') {
    const id = await getCdnPath(host);
    if (!id) throw responseNoSite();
    return { CDN: DEFAULT_CDN, id };
  }
  return host;
}

export async function getCdnBaseUrl(host: Host): Promise<string> {
  const { CDN, id } = await getCdnLocation(host);
  return `${CDN}${id}/`;
}

function withBaseUrl<T extends string | undefined>(baseUrl: string, url: T): T {
  if (!url) return url;
  return `${baseUrl}${url}` as T;
}

/**
 * Basic comparison for checking that the title and (possible) slug are the same
 */
function foldTitleString(title?: string): string | undefined {
  return title?.replace(/[-\s_]/g, '').toLowerCase();
}

/**
 * If the site title and the first nav item are the same, remove it.
 */
function removeSingleNavItems(config: SiteManifest) {
  if (
    config?.nav?.length === 1 &&
    foldTitleString(config.nav[0].title) === foldTitleString(config.title)
  ) {
    config.nav = [];
  }
}

export async function getConfig(host: Host): Promise<SiteManifest> {
  const location = await getCdnLocation(host);
  const baseUrl = await getCdnBaseUrl(location);
  const { id } = location;
  if (!id) throw responseNoSite();
  const cached = getConfigCache().get<SiteManifest>(id);
  // Load the data from an in memory cache.
  if (cached) return cached;
  const response = await fetch(withBaseUrl(baseUrl, 'config.json'));
  if (response.status === 404) throw responseNoSite();
  const data = (await response.json()) as SiteManifest;
  data.id = id;
  removeSingleNavItems(data);
  updateSiteManifestStaticLinksInplace(data, (url) => withPublicFolderUrl(baseUrl, url));
  getConfigCache().set<SiteManifest>(id, data);
  return data;
}

export async function getObjectsInv(host: Host): Promise<Buffer | undefined> {
  const baseUrl = await getCdnBaseUrl(host);
  if (!baseUrl) return;
  const url = `${baseUrl}objects.inv`;
  const response = await fetch(url);
  if (response.status === 404) return;
  const buffer = await response.buffer();
  return buffer;
}

async function getData(
  baseUrl: string,
  config?: SiteManifest,
  project?: string,
  slug?: string,
): Promise<PageLoader | null> {
  if (!project || !slug || !config) throw responseNoArticle();
  const { id } = config;
  if (!id) throw responseNoSite();
  const response = await fetch(withBaseUrl(baseUrl, `content/${project}/${slug}.json`));
  if (response.status === 404) throw responseNoArticle();
  const data = (await response.json()) as PageLoader;
  return updatePageStaticLinksInplace(data, (url) => withPublicFolderUrl(baseUrl, url));
}

export async function getPage(
  host: Host,
  opts: {
    domain?: string;
    project?: string;
    loadIndexPage?: boolean;
    slug?: string;
    redirect?: boolean | string;
  },
): Promise<PageLoader | Response | null> {
  const projectName = opts.project;
  const baseUrl = await getCdnBaseUrl(host);
  const config = await getConfig(host);
  if (!config) throw responseNoSite();
  const project = getProject(config, projectName);
  if (!project) throw responseNoArticle();
  if (opts.slug === project.index && opts.redirect) {
    return redirect(`${typeof opts.redirect === 'string' ? opts.redirect : '/'}${projectName}`);
  }
  const slug = opts.loadIndexPage || opts.slug == null ? project.index : opts.slug;
  const loader = await getData(baseUrl, config, projectName, slug).catch((e) => {
    console.error(e);
    return null;
  });
  if (!loader) throw responseNoArticle();
  const footer = getFooterLinks(config, projectName, slug);
  return { ...loader, footer, domain: opts.domain as string };
}
