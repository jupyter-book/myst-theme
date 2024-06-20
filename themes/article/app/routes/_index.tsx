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
import type { LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';
export { links } from './$';
import { useRouteError, isRouteErrorResponse } from '@remix-run/react';

type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: V2_MetaFunction<typeof loader> = ({ data, location }) => {
  if (!data) return [];

  const config: SiteManifest = data.config;
  const project: ManifestProject = data.project;

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

export const loader: LoaderFunction = async ({ params, request }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return { config, project, page };
};

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
