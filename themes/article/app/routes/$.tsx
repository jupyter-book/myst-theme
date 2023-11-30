import { isFlatSite, type PageLoader } from '@myst-theme/common';
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { getMetaTagsForArticle, KatexCSS, ArticlePageCatchBoundary } from '@myst-theme/site';
import { getConfig, getPage } from '~/utils/loaders.server';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import { ArticlePageAndNavigation } from '../components/ArticlePageAndNavigation';
import { ArticlePage } from '../components/ArticlePage';
import { ComputeOptionsProvider } from '@myst-theme/jupyter';
import { ProjectProvider, useBaseurl } from '@myst-theme/providers';
import { ThebeLoaderAndServer } from '@myst-theme/jupyter';

export const meta: MetaFunction = (args) => {
  const config = args.parentsData?.root?.config as SiteManifest | undefined;
  const data = args.data as PageLoader | undefined;
  if (!config || !data || !data.frontmatter) return {};
  return getMetaTagsForArticle({
    origin: '',
    url: args.location.pathname,
    title: `${data.frontmatter.title} - ${config?.title}`,
    description: data.frontmatter.description,
    image: (data.frontmatter.thumbnailOptimized || data.frontmatter.thumbnail) ?? undefined,
  });
};

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ params, request }) => {
  const [first, second] = new URL(request.url).pathname.slice(1).split('/');
  const projectName = second ? first : undefined;
  const slug = second || first;
  const config = await getConfig();
  const flat = isFlatSite(config);
  const page = await getPage(request, {
    project: flat ? projectName : projectName ?? slug,
    slug: flat ? slug : projectName ? slug : undefined,
    redirect: process.env.MODE === 'static' ? false : true,
  });
  return page;
};

export default function Page() {
  // TODO handle outline?
  // const { container, outline } = useOutlineHeight();
  // const { hide_outline } = (article.frontmatter as any)?.options ?? {};
  const baseurl = useBaseurl();
  const article = useLoaderData<PageLoader>() as PageLoader;

  return (
    <ArticlePageAndNavigation>
      <ProjectProvider>
        <ComputeOptionsProvider
          features={{ notebookCompute: true, figureCompute: true, launchBinder: true }}
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
