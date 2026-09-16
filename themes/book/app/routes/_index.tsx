import {
  KatexCSS,
  getMetaTagsForArticle,
  responseNoArticle,
  responseNoSite,
} from '@myst-theme/site';
import { redirect } from 'react-router';
import { getConfig, getPage } from '~/utils/loaders.server';
import Page from './$';
import { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';
import type { Route } from './+types/_index';

type ManifestProject = Required<SiteManifest>['projects'][0];

export async function loader({ request }: Route.LoaderArgs) {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return { config, page, project };
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  if (!loaderData) return [];

  const config: SiteManifest = loaderData.config;
  const project: ManifestProject = loaderData.project;

  return getMetaTagsForArticle({
    origin: '',
    url: location.pathname,
    title: config?.title ?? project.title,
    description: config.description ?? project.description ?? undefined,
    image: (project.thumbnailOptimized || project.thumbnail) ?? undefined,
    keywords: config.keywords ?? project.keywords ?? [],
    twitter: config?.options?.twitter,
  });
}

export function links(): ReturnType<Route.LinksFunction> {
  return [KatexCSS];
}

export default Page;
