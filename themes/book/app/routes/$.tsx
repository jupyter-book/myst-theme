import {
  json,
  type V2_MetaFunction,
  type LinksFunction,
  type LoaderFunction,
} from '@remix-run/node';
import { getProject, isFlatSite, type PageLoader } from '@myst-theme/common';
import {
  KatexCSS,
  useOutlineHeight,
  useSidebarHeight,
  PrimaryNavigation,
  TopNav,
  getMetaTagsForArticle,
  ErrorDocumentNotFound,
  ErrorUnhandled,
} from '@myst-theme/site';
import { getConfig, getPage } from '~/utils/loaders.server';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import {
  TabStateProvider,
  UiStateProvider,
  useBaseurl,
  useSiteManifest,
  useThemeTop,
  ProjectProvider,
  BannerStateProvider,
  useBannerState,
} from '@myst-theme/providers';
import { ComputeOptionsProvider, ThebeLoaderAndServer } from '@myst-theme/jupyter';
import { MadeWithMyst } from '@myst-theme/icons';
import { ArticlePage } from '../components/ArticlePage.js';
import { Footer } from '../components/Footer.js';
import { Banner } from '../components/Banner.js';
import { SidebarFooter } from '../components/SidebarFooter.js';
import type { TemplateOptions } from '../types.js';
import { useRouteError, isRouteErrorResponse } from '@remix-run/react';
type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: V2_MetaFunction<typeof loader> = ({ data, matches, location }) => {
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
  const [first, ...rest] = new URL(request.url).pathname.slice(1).split('/');
  const config = await getConfig();
  const project = getProject(config, first);
  const projectName = project?.slug === first ? first : undefined;
  const slugParts = projectName ? rest : [first, ...rest];
  const slug = slugParts.length ? slugParts.join('.') : undefined;
  const flat = isFlatSite(config);
  const page = await getPage(request, {
    project: flat ? projectName : (projectName ?? slug),
    slug: flat ? slug : projectName ? slug : undefined,
    redirect: process.env.MODE === 'static' ? false : true,
  });
  return json({ config, page, project });
};

function ArticlePageAndNavigationInternal({
  children,
  hide_toc,
  hideSearch,
  projectSlug,
  inset = 20, // begin text 20px from the top (aligned with menu)
}: {
  hide_toc?: boolean;
  hideSearch?: boolean;
  projectSlug?: string;
  children: React.ReactNode;
  inset?: number;
}) {
  const top = useThemeTop();
  const { container, toc } = useSidebarHeight(top, inset);
  const siteManifest = useSiteManifest() as any;
  const projectParts = { ...siteManifest?.projects?.[0]?.parts, ...siteManifest?.parts };
  const { bannerState } = useBannerState();
  return (
    <>
      <TabStateProvider>
        {projectParts?.banner && <Banner content={projectParts.banner.mdast} />}
      </TabStateProvider>
      <TopNav hideToc={hide_toc} hideSearch={hideSearch} />
      {bannerState.visible != undefined && (
        <PrimaryNavigation
          sidebarRef={toc}
          hide_toc={hide_toc}
          footer={<SidebarFooter content={projectParts?.primary_sidebar_footer?.mdast} />}
          projectSlug={projectSlug}
        />
      )}
      <TabStateProvider>
        <main
          ref={container}
          className="article-grid grid-gap"
          // article does not need to get top as it is in the page flow (z-0)
          // style={{ marginTop: top }}
        >
          {children}
        </main>
      </TabStateProvider>

      <TabStateProvider>
        {projectParts?.footer && <Footer content={projectParts.footer.mdast} />}
      </TabStateProvider>
    </>
  );
}

export function ArticlePageAndNavigation({
  children,
  hide_toc,
  hideSearch,
  projectSlug,
  inset = 20, // begin text 20px from the top (aligned with menu)
}: {
  hide_toc?: boolean;
  hideSearch?: boolean;
  projectSlug?: string;
  children: React.ReactNode;
  inset?: number;
}) {
  return (
    <UiStateProvider>
      <BannerStateProvider>
        <ArticlePageAndNavigationInternal
          children={children}
          hide_toc={hide_toc}
          hideSearch={hideSearch}
          projectSlug={projectSlug}
          inset={inset}
        />
      </BannerStateProvider>
    </UiStateProvider>
  );
}

export default function Page() {
  const { container } = useOutlineHeight();
  const data = useLoaderData() as { page: PageLoader; project: ManifestProject };
  const baseurl = useBaseurl();
  const pageDesign: TemplateOptions = (data.page.frontmatter as any)?.site ?? {};
  const siteDesign: TemplateOptions =
    (useSiteManifest() as SiteManifest & TemplateOptions)?.options ?? {};
  const { hide_toc, hide_search, hide_footer_links } = {
    ...siteDesign,
    ...pageDesign,
  };
  return (
    <ArticlePageAndNavigation
      hide_toc={hide_toc}
      hideSearch={hide_search}
      projectSlug={data.page.project}
    >
      {/* <ProjectProvider project={project}> */}
      <ProjectProvider>
        <ComputeOptionsProvider
          features={{ notebookCompute: true, figureCompute: true, launchBinder: false }}
        >
          <ThebeLoaderAndServer baseurl={baseurl}>
            <article
              ref={container}
              className="article-grid subgrid-gap col-screen article content"
            >
              <ArticlePage article={data.page} hide_all_footer_links={hide_footer_links} />
            </article>
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
      <article className="article">
        {isRouteErrorResponse(error) ? (
          <ErrorDocumentNotFound />
        ) : (
          <ErrorUnhandled error={error as any} />
        )}
      </article>
    </ArticlePageAndNavigation>
  );
}
