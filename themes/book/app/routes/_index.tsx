import {
  KatexCSS,
  getMetaTagsForArticle,
  responseNoArticle,
  responseNoSite,
} from '@myst-theme/site';
import type { LinksFunction, LoaderFunction, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { getConfig, getPage } from '~/utils/loaders.server';
import Page from './$';
import { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';

type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: MetaFunction<typeof loader> = ({ loaderData, location }) => {
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
};

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ request }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return { config, page, project };
};

export default Page;
