import { getProject, isFlatSite, parsePathname, type PageLoader } from '@myst-theme/common';
import {
  data,
  redirect,
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
} from 'react-router';
import {
  getMetaTagsForArticle,
  KatexCSS,
  ErrorDocumentNotFound,
  ErrorUnhandled,
} from '@myst-theme/site';
import { getConfig, getPage, getStaticFileUrl } from '~/utils/loaders.server';
import { useLoaderData } from 'react-router';
import type { SiteManifest } from 'myst-config';
import { ArticlePageAndNavigation } from '../components/ArticlePageAndNavigation';
import { ArticlePage } from '../components/ArticlePage';
import { ComputeOptionsProvider } from '@myst-theme/jupyter';
import { ProjectProvider, useBaseurl } from '@myst-theme/providers';
import { ThebeLoaderAndServer } from '@myst-theme/jupyter';
import { useRouteError, isRouteErrorResponse } from 'react-router';

import type { Route } from './+types/$slug.tsx';

type ManifestProject = Required<SiteManifest>['projects'][0];

export async function loader({ params, request }: Route.LoaderArgs): Promise<{
  config: SiteManifest;
  page: PageLoader;
  project: ManifestProject | undefined;
}> {
  const url = new URL(request.url);
  const config = await getConfig();
  const project = getProject(config);
  const slug = params['slug'];
  try {
    const page = await getPage(request, {
      slug,
      redirect: !import.meta.env.VITE_BUILD_HTML,
    });
    return { config, page, project };
  } catch (e) {
    if (e instanceof Response && e.status === 404) {
      const cdnUrl = await getStaticFileUrl(url.pathname);
      if (cdnUrl) throw redirect(cdnUrl);
    }
    throw e;
  }
};

export function meta({ loaderData, location }: Route.MetaArgs) => {  
  if (loaderData === undefined) return [];

  const config: SiteManifest = loaderData.config;
  const project: ManifestProject = loaderData.project;
  const page: PageLoader['frontmatter'] = loaderData.page.frontmatter;

  const siteTitle = config?.title ?? project?.title ?? '';
  return getMetaTagsForArticle({
    origin: '',
    url: location.pathname,
    title: page?.title ? `${page.title}${siteTitle ? ` - ${siteTitle}` : ''}` : siteTitle,
    description: page?.description ?? project?.description ?? config?.description ?? undefined,
    image:
      (page?.thumbnailOptimized || page?.thumbnail) ??
      (project?.thumbnailOptimized || project?.thumbnail) ??
      undefined,
    twitter: config?.options?.twitter,
    keywords: page?.keywords ?? project?.keywords ?? config?.keywords ?? [],
  });
};

export function links(): ReturnType<Route.LinksFunction> {
  return [KatexCSS];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  // TODO handle outline?
  // const { container, outline } = useOutlineHeight();
  // const { hide_outline } = (article.frontmatter as any)?.options ?? {};
  const baseurl = useBaseurl();
  const { page: article } = loaderData;

  return (
    <ArticlePageAndNavigation>
      <ProjectProvider>
        <ComputeOptionsProvider
          features={{ notebookCompute: false, figureCompute: true, launchBinder: true }}
        >
          <ThebeLoaderAndServer baseurl={baseurl ?? ''}>
            <ArticlePage article={article} />
          </ThebeLoaderAndServer>
        </ComputeOptionsProvider>
      </ProjectProvider>
    </ArticlePageAndNavigation>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <ArticlePageAndNavigation>
      <article className="article content ">
        {isRouteErrorResponse(error) ? (
          <ErrorDocumentNotFound />
        ) : (
          <ErrorUnhandled error={error as any} />
        )}
      </article>
    </ArticlePageAndNavigation>
  );
}
