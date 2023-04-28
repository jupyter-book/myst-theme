import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import type { PageLoader } from '@myst-theme/site';
import {
  FooterLinksBlock,
  Bibliography,
  ContentBlocks,
  getMetaTagsForArticle,
  KatexCSS,
  useOutlineHeight,
  DocumentOutline,
  DEFAULT_NAV_HEIGHT,
  Navigation,
  TopNav,
  ArticlePageCatchBoundary,
} from '@myst-theme/site';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { getPage } from '~/utils/loaders.server';
import { Link, NavLink, useLoaderData, useLocation } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import {
  ReferencesProvider,
  TabStateProvider,
  UiStateProvider,
  useSiteManifest,
} from '@myst-theme/providers';
import { extractPart, copyNode } from 'myst-common';
import classNames from 'classnames';
import { MadeWithMyst } from '@myst-theme/icons';

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
  const { project, slug } = params;
  return getPage(request, { project, slug, redirect: true });
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
        <article className="article content article-grid article-grid-gap">{children}</article>
      </TabStateProvider>
    </UiStateProvider>
  );
}

function ArticleNavigation() {
  const site = useSiteManifest();
  const { pathname } = useLocation();
  const project = site?.projects?.[0];
  const exact = pathname === `/${project?.slug}`;
  return (
    <nav className="col-page-inset">
      <div className="border-y border-gray-200 py-3 mt-4 mb-6 flex flex-row justify-around">
        <Link
          to={`/${project?.slug}`}
          prefetch="intent"
          className={classNames('no-underline', { 'text-blue-600': exact })}
        >
          Article
        </Link>
        {project?.pages
          .filter((p) => 'slug' in p)
          .map((p) => {
            if (p.level === 1)
              return (
                <NavLink
                  key={p.slug}
                  to={`/${project?.slug}/${p.slug}`}
                  prefetch="intent"
                  className={({ isActive }) =>
                    classNames('no-underline', { 'text-blue-600': isActive })
                  }
                >
                  {p.title}
                </NavLink>
              );
            return null;
          })}
      </div>
    </nav>
  );
}

export function Article({ article }: { article: PageLoader }) {
  const keywords = article.frontmatter?.keywords ?? [];
  const tree = copyNode(article.mdast);
  const abstract = extractPart(tree, 'abstract');
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      {abstract && (
        <>
          <span className="font-semibold">Abstract</span>
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-1 rounded-sm m-3">
            <ContentBlocks mdast={abstract} className="col-body" />
          </div>
        </>
      )}
      {keywords.length > 0 && (
        <div className="mb-10">
          <span className="font-semibold mr-2">Keywords:</span>
          {keywords.map((k, i) => (
            <span
              key={k}
              className={classNames({
                "after:content-[','] after:mr-1": i < keywords.length - 1,
              })}
            >
              {k}
            </span>
          ))}
        </div>
      )}
      <ContentBlocks mdast={tree} />
      <Bibliography />
    </ReferencesProvider>
  );
}

export function ArticlePage({ article }: { article: PageLoader }) {
  const { projects } = useSiteManifest() ?? {};
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <section className="col-body-outset">
        <FrontmatterBlock frontmatter={projects?.[0] ?? article.frontmatter} authorStyle="list" />
        {/* <Actions /> */}
      </section>
      <ArticleNavigation />
      <main className="article-grid article-subgrid-gap col-screen">
        <Article article={article} />
      </main>
      <FooterLinksBlock links={article.footer} />
    </ReferencesProvider>
  );
}

export default function Page({ top = DEFAULT_NAV_HEIGHT }: { top?: number }) {
  // const { container, outline } = useOutlineHeight();
  const article = useLoaderData<PageLoader>() as PageLoader;
  const { hide_outline, hide_toc } = (article.frontmatter as any)?.design ?? {};
  return (
    <ArticlePageAndNavigation hide_toc={hide_toc}>
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
