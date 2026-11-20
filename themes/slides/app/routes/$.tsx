import { redirect, isRouteErrorResponse } from 'react-router';
import { getProject, type PageLoader } from '@myst-theme/common';
import {
  KatexCSS,
  getMetaTagsForArticle,
  ErrorDocumentNotFound,
  ErrorUnhandled,
} from '@myst-theme/site';
import { getConfig, getPage, getStaticFileUrl } from '~/utils/loaders.server';
import type { SiteManifest } from 'myst-config';
import { ProjectProvider } from '@myst-theme/providers';
import { Deck } from '../components/Deck';

import type { Route } from './+types/$';

type ManifestProject = Required<SiteManifest>['projects'][0];

export async function loader({ request, params }: Route.LoaderArgs): Promise<{
  config: SiteManifest;
  page: PageLoader;
  project: ManifestProject | undefined;
}> {
  const url = new URL(request.url);
  const config = await getConfig();
  const project = getProject(config);
  // Nested folder URLs (`folders: true`) map to dotted page slugs.
  const slug = params['*']
    .split('/')
    .filter((item) => !!item)
    .join('.');
  try {
    // Static HTML builds skip the redirect from the index page slug to the root URL.
    const page = await getPage(request, { slug, redirect: !import.meta.env.VITE_BUILD_HTML });
    return { config, page, project };
  } catch (e) {
    if (e instanceof Response && e.status === 404) {
      const cdnUrl = await getStaticFileUrl(url.pathname);
      if (cdnUrl) throw redirect(cdnUrl);
    }
    throw e;
  }
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  if (loaderData === undefined) return [];
  const { config, project } = loaderData;
  const page = loaderData.page.frontmatter;
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
}

export function links(): ReturnType<Route.LinksFunction> {
  return [KatexCSS];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <ProjectProvider>
      <Deck article={loaderData.page} />
    </ProjectProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose">
      {isRouteErrorResponse(error) ? <ErrorDocumentNotFound /> : <ErrorUnhandled error={error} />}
    </main>
  );
}
