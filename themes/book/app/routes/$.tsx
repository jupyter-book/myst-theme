import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import type { PageLoader } from '@myst-theme/site';
import {
  getMetaTagsForArticle,
  KatexCSS,
  ArticlePage,
  useOutlineHeight,
  useTocHeight,
  DocumentOutline,
  DEFAULT_NAV_HEIGHT,
  Navigation,
  TopNav,
  ArticlePageCatchBoundary,
} from '@myst-theme/site';
import { getConfig, getPage, isFlatSite } from '~/utils/loaders.server';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import { TabStateProvider, UiStateProvider } from '@myst-theme/providers';
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
  projectSlug,
  top = DEFAULT_NAV_HEIGHT,
}: {
  top?: number;
  hide_toc?: boolean;
  projectSlug?: string;
  children: React.ReactNode;
}) {
  const { container, toc } = useTocHeight(top);
  return (
    <UiStateProvider>
      <Navigation
        tocRef={toc}
        top={top}
        hide_toc={hide_toc}
        footer={<MadeWithMyst />}
        projectSlug={projectSlug}
      >
        <TopNav />
        <TabStateProvider>
          <article
            ref={container}
            className="article content article-grid article-grid-gap"
            style={{ marginTop: top + 16 }}
          >
            {children}
          </article>
        </TabStateProvider>
      </Navigation>
    </UiStateProvider>
  );
}

export default function Page({ top = DEFAULT_NAV_HEIGHT }: { top?: number }) {
  const { container, outline } = useOutlineHeight();
  const article = useLoaderData<PageLoader>() as PageLoader;
  const { hide_outline, hide_toc } = (article.frontmatter as any)?.design ?? {};
  return (
    <ArticlePageAndNavigation hide_toc={hide_toc} projectSlug={article.project}>
      <main ref={container} className="article-grid article-subgrid-gap col-screen">
        <ArticlePage article={article} />
        {!hide_outline && <DocumentOutline outlineRef={outline} top={top} />}
      </main>
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
