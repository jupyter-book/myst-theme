import { isFlatSite, type PageLoader } from '@myst-theme/common';
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import {
  FooterLinksBlock,
  Bibliography,
  ContentBlocks,
  getMetaTagsForArticle,
  KatexCSS,
  ArticlePageCatchBoundary,
  DocumentOutline,
  ArticleHeader,
  SupportingDocuments,
  Abstract,
  Keywords,
} from '@myst-theme/site';
import {
  ErrorTray,
  LaunchBinder,
  NotebookToolbar,
  useCanCompute,
  useThebeOptions,
} from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { getConfig, getPage } from '~/utils/loaders.server';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import {
  GridSystemProvider,
  ReferencesProvider,
  TabStateProvider,
  UiStateProvider,
  useBaseurl,
  useGridSystemProvider,
  useLinkProvider,
  useSiteManifest,
} from '@myst-theme/providers';
import type { GenericParent } from 'myst-common';
import { extractPart, copyNode } from 'myst-common';
import classNames from 'classnames';
import { BusyScopeProvider, ConnectionStatusTray, ExecuteScopeProvider } from '@myst-theme/jupyter';
import { SourceFileKind } from 'myst-spec-ext';

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
  const project = second ? first : undefined;
  const slug = second || first;
  const config = await getConfig();
  const flat = isFlatSite(config);
  const page = await getPage(request, {
    project: flat ? project : project ?? slug,
    slug: flat ? slug : project ? slug : undefined,
    redirect: process.env.MODE === 'static' ? false : true,
  });
  return page;
};

export function ArticlePageAndNavigation({ children }: { children: React.ReactNode }) {
  return (
    <UiStateProvider>
      <TabStateProvider>
        <GridSystemProvider gridSystem="article-left-grid">
          <article className="article content article-left-grid subgrid-gap">{children}</article>
        </GridSystemProvider>
      </TabStateProvider>
    </UiStateProvider>
  );
}

interface ArticleTemplateOptions {
  hide_toc?: boolean;
  hide_footer_links?: boolean;
}

function formatToTitle(format: string) {
  switch (format) {
    case 'pdf':
      return 'PDF';
    case 'meca':
      return 'MECA';
    case 'xml':
      return 'JATS';
    default:
      break;
  }
  return format;
}

function Downloads() {
  const site = useSiteManifest();
  const project = site?.projects?.[0];
  const downloads = [...(project?.exports ?? []), ...(project?.pages?.[0]?.exports ?? [])];
  if (downloads.length === 0) return null;
  return (
    <div className="col-margin mt-3 mx-5 lg:m-0 lg:w-[300px]">
      <div className="flex flex-wrap gap-2 lg:flex-col w-fit lg:mx-auto">
        {downloads.map((action) => (
          <a
            key={action.url}
            href={action.url}
            className="inline-block mr-2 no-underline lg:mr-0 lg:block"
          >
            <DocumentArrowDownIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />
            <span>Download {formatToTitle(action.format)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Article({
  article,
  hideKeywords,
  hideOutline,
  hideTitle,
}: {
  article: PageLoader;
  hideKeywords?: boolean;
  hideOutline?: boolean;
  hideTitle?: boolean;
}) {
  const keywords = article.frontmatter?.keywords ?? [];
  const tree = copyNode(article.mdast);
  const abstract = extractPart(tree, 'abstract');
  const { title, subtitle } = article.frontmatter;

  const thebe = useThebeOptions();
  const canCompute = !!thebe && (article.frontmatter as any)?.thebe !== false;
  // TODO in lieu of extended frontmatter or theme options
  const enable_notebook_toolbar = false;
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider contents={article}>
          {!hideTitle && <FrontmatterBlock frontmatter={{ title, subtitle }} className="mb-5" />}
          {!hideOutline && (
            <div className="sticky top-0 z-10 hidden h-0 pt-2 ml-10 col-margin-right lg:block">
              <DocumentOutline className="relative">
                <SupportingDocuments />
              </DocumentOutline>
            </div>
          )}
          {canCompute && enable_notebook_toolbar && article.kind === SourceFileKind.Notebook && (
            <NotebookToolbar showLaunch />
          )}
          <ErrorTray pageSlug={article.slug} />
          <div id="skip-to-article" />
          <Abstract content={abstract as GenericParent} />
          <Keywords keywords={keywords} hideKeywords={hideKeywords} />
          <ContentBlocks mdast={tree as GenericParent} />
          <Bibliography />
          <ConnectionStatusTray />
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
}

export function ArticlePage({ article }: { article: PageLoader }) {
  const grid = useGridSystemProvider();
  const { projects, hide_footer_links } = (useSiteManifest() ?? {}) as SiteManifest &
    ArticleTemplateOptions;
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const project = projects?.[0];
  const isIndex = article.slug === project?.index;

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider contents={article}>
          <ArticleHeader frontmatter={project as any}>
            <div className="pt-5 md:self-center h-fit lg:pt-0 col-body lg:col-margin-right-inset">
              <Downloads />
              <div className="col-margin mt-3 mx-5 lg:mt-2 lg:mx-0 lg:w-[300px]">
                <div className="flex flex-wrap gap-2 lg:flex-col w-[147px] pl-[1px] lg:mx-auto">
                  <LaunchBinder style="link" location={article.location} />
                </div>
              </div>
            </div>
          </ArticleHeader>
          <main
            id="main"
            className={classNames(grid, 'subgrid-gap col-screen', {
              'pt-10': isIndex,
            })}
          >
            {!isIndex && (
              <div className="flex items-center p-3 mb-10 border-y bg-slate-50 dark:bg-slate-600 border-y-slate-300 col-screen">
                <Link
                  to={baseurl || '/'}
                  className="flex gap-1 px-2 py-1 font-normal no-underline border rounded bg-slate-200 border-slate-600 hover:bg-slate-800 hover:text-white hover:border-transparent"
                >
                  <ArrowLeftIcon
                    width="1rem"
                    height="1rem"
                    className="self-center transition-transform group-hover:-translate-x-1 shrink-0"
                  />
                  <span>Back to Article</span>
                </Link>
                <div className="flex-grow text-center">{article.frontmatter.title}</div>
                <div className="mr-2">
                  <LaunchBinder style="button" location={article.location} />
                </div>
                <a
                  href={article.frontmatter?.exports?.[0]?.url}
                  className="flex gap-1 px-2 py-1 font-normal no-underline border rounded bg-slate-200 border-slate-600 hover:bg-slate-800 hover:text-white hover:border-transparent"
                >
                  <DocumentArrowDownIcon
                    width="1rem"
                    height="1rem"
                    className="self-center transition-transform group-hover:-translate-x-1 shrink-0"
                  />
                  <span>Download {article.kind}</span>
                </a>
              </div>
            )}
            <Article article={article} hideKeywords={!isIndex} hideTitle={isIndex} />
          </main>
          {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
}

export default function Page() {
  // const { container, outline } = useOutlineHeight();
  const article = useLoaderData<PageLoader>() as PageLoader;
  const { hide_outline } = (article.frontmatter as any)?.options ?? {};

  return (
    <ArticlePageAndNavigation>
      <ArticlePage article={article} />
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
