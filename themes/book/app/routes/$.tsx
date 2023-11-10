import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { isFlatSite, type PageLoader } from '@myst-theme/common';
import {
  getMetaTagsForArticle,
  KatexCSS,
  ArticlePage,
  useOutlineHeight,
  useTocHeight,
  DocumentOutline,
  Navigation,
  TopNav,
  ArticlePageCatchBoundary,
} from '@myst-theme/site';
import { getConfig, getPage } from '~/utils/loaders.server';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import {
  TabStateProvider,
  UiStateProvider,
  useSiteManifest,
  useThemeTop,
} from '@myst-theme/providers';
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
  inset = 20, // begin text 20px from the top (aligned with menu)
}: {
  hide_toc?: boolean;
  projectSlug?: string;
  children: React.ReactNode;
  inset?: number;
}) {
  const top = useThemeTop();
  const { container, toc } = useTocHeight(top, inset);
  return (
    <UiStateProvider>
      <TopNav />
      <Navigation
        tocRef={toc}
        hide_toc={hide_toc}
        footer={<MadeWithMyst />}
        projectSlug={projectSlug}
      />
      <TabStateProvider>
        <article
          ref={container}
          className="article content article-grid grid-gap"
          style={{ marginTop: top }}
        >
          {children}
        </article>
      </TabStateProvider>
    </UiStateProvider>
  );
}

interface BookThemeTemplateOptions {
  hide_toc?: boolean;
  hide_outline?: boolean;
  hide_footer_links?: boolean;
}

export default function Page() {
  const { container, outline } = useOutlineHeight();
  const top = useThemeTop();
  const article = useLoaderData<PageLoader>() as PageLoader;
  const pageDesign: BookThemeTemplateOptions = (article.frontmatter as any)?.options?.design ?? {};
  const siteDesign: BookThemeTemplateOptions =
    (useSiteManifest() as SiteManifest & BookThemeTemplateOptions)?.options?.design ?? {};
  const { hide_toc, hide_outline, hide_footer_links } = { ...siteDesign, ...pageDesign };
  return (
    <ArticlePageAndNavigation hide_toc={hide_toc} projectSlug={article.project}>
      <main ref={container} className="article-grid subgrid-gap col-screen">
        {!hide_outline && (
          <div className="sticky z-10 hidden h-0 col-margin-right-inset lg:block" style={{ top }}>
            <DocumentOutline top={16} className="relative" outlineRef={outline} />
          </div>
        )}
        <ArticlePage article={article} hide_all_footer_links={hide_footer_links} showAbstract />
      </main>
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
