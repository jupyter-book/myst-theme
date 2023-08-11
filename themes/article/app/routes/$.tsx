import { isFlatSite, type PageLoader } from '@myst-theme/common';
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import {
  FooterLinksBlock,
  Bibliography,
  ContentBlocks,
  getMetaTagsForArticle,
  KatexCSS,
  DEFAULT_NAV_HEIGHT,
  ArticlePageCatchBoundary,
  DocumentOutline,
  ArticleHeader,
  SupportingDocuments,
  Abstract,
  Keywords,
} from '@myst-theme/site';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import DocumentArrowDownIcon from '@heroicons/react/24/outline/DocumentArrowDownIcon';
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
import { BusyScopeProvider, ExecuteScopeProvider } from '@myst-theme/jupyter';

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

export function ArticlePageAndNavigation({
  children,
  hide_toc,
  top = DEFAULT_NAV_HEIGHT,
}: {
  top?: number;
  hide_toc?: boolean;
  children: React.ReactNode;
}) {
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

function Actions({ actions }: { actions: { format: string; url: string; static?: boolean }[] }) {
  return (
    <div className="col-margin mt-3 lg:mt-0 lg:w-[350px] lg:self-center">
      <div className="flex flex-col gap-2 w-fit lg:m-auto">
        {actions?.map((action) => (
          <a
            key={action.url}
            href={action.url}
            className="flex gap-1 px-2 py-1 font-normal no-underline bg-white border rounded"
          >
            <DocumentArrowDownIcon className="self-center w-4 h-4 transition-transform group-hover:-translate-x-1 shrink-0" />
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
              <DocumentOutline top={0} className="relative">
                <SupportingDocuments />
              </DocumentOutline>
            </div>
          )}
          <Abstract content={abstract as GenericParent} />
          <Keywords keywords={keywords} hideKeywords={hideKeywords} />
          <ContentBlocks mdast={tree as GenericParent} />
          <Bibliography />
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
          <ArticleHeader frontmatter={project as any} />
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

export default function Page({ top = DEFAULT_NAV_HEIGHT }: { top?: number }) {
  // const { container, outline } = useOutlineHeight();
  const article = useLoaderData<PageLoader>() as PageLoader;
  const { hide_outline } = (article.frontmatter as any)?.design ?? {};

  return (
    <ArticlePageAndNavigation>
      <ArticlePage article={article} />
      {/* {!hide_outline && <DocumentOutline outlineRef={outline} top={top} height={height} />} */}
    </ArticlePageAndNavigation>
  );
}

export function CatchBoundary() {
  return (
    <ArticlePageAndNavigation>
      <main className="article-content">
        <ArticlePageCatchBoundary />
      </main>
    </ArticlePageAndNavigation>
  );
}
