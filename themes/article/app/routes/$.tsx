import { getProject, isFlatSite, type PageLoader } from '@myst-theme/common';
import {
  json,
  type LinksFunction,
  type LoaderFunction,
  type V2_MetaFunction,
} from '@remix-run/node';
import { getMetaTagsForArticle, KatexCSS, ArticlePageCatchBoundary } from '@myst-theme/site';
import { getConfig, getPage } from '~/utils/loaders.server';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import { ArticlePageAndNavigation } from '../components/ArticlePageAndNavigation';
import { ArticlePage } from '../components/ArticlePage';
import { ComputeOptionsProvider } from '@myst-theme/jupyter';
import { ProjectProvider, useBaseurl } from '@myst-theme/providers';
import { ThebeLoaderAndServer } from '@myst-theme/jupyter';

type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: V2_MetaFunction = ({ data, matches, location }) => {
  if (!data) return [];

  const config: SiteManifest = data.config;
  const project: ManifestProject = data.project;
  const page: PageLoader['frontmatter'] = data.page.frontmatter;
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

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ params, request }) => {
  const [first, second] = new URL(request.url).pathname.slice(1).split('/');
  const projectName = second ? first : undefined;
  const slug = second || first;
  const config = await getConfig();
  const project = getProject(config, projectName ?? slug);
  const flat = isFlatSite(config);
  const page = await getPage(request, {
    project: flat ? projectName : projectName ?? slug,
    slug: flat ? slug : projectName ? slug : undefined,
    redirect: process.env.MODE === 'static' ? false : true,
  });
  return json({ config, project, page });
};

export default function Page() {
  // TODO handle outline?
  // const { container, outline } = useOutlineHeight();
  // const { hide_outline } = (article.frontmatter as any)?.options ?? {};
  const baseurl = useBaseurl();
  const { page: article } = useLoaderData() as { page: PageLoader };

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

export function CatchBoundary() {
  return (
    <ArticlePageAndNavigation>
      <main className="article">
        <ArticlePageCatchBoundary />
      </main>
    </ArticlePageAndNavigation>
  );
}
