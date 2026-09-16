import {
  getMetaTagsForArticle,
  responseNoArticle,
  responseNoSite,
  ErrorDocumentNotFound,
  ErrorUnhandled,
} from '@myst-theme/site';
import Page from './$';
import { ArticlePageAndNavigation } from '../components/ArticlePageAndNavigation';
import { getConfig, getPage } from '../utils/loaders.server';
import { redirect } from 'react-router';
import { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';
export { links } from './$';
import { useRouteError, isRouteErrorResponse } from 'react-router';

import type { Route } from './+types/_index';

type ManifestProject = Required<SiteManifest>['projects'][0];

export async function loader({ request }: Route.LoaderArgs) {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return { config, project, page };
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

export default Page;

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <ArticlePageAndNavigation>
      <main className="article">
        {isRouteErrorResponse(error) ? (
          <ErrorDocumentNotFound />
        ) : (
          <ErrorUnhandled error={error as any} />
        )}
      </main>
    </ArticlePageAndNavigation>
  );
}
