import {
  KatexCSS,
  getMetaTagsForArticle,
  responseNoArticle,
  responseNoSite,
} from '@myst-theme/site';
import type { LinksFunction, LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getConfig, getPage } from '~/utils/loaders.server';
import type { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';

import {} from '@remix-run/node';
import { type PageLoader } from '@myst-theme/common';
import { useOutlineHeight, useSidebarHeight, PrimaryNavigation, TopNav } from '@myst-theme/site';
import { useLoaderData } from '@remix-run/react';
import {
  TabStateProvider,
  UiStateProvider,
  useBaseurl,
  useSiteManifest,
  useThemeTop,
  ProjectProvider,
} from '@myst-theme/providers';
import { MadeWithMyst } from '@myst-theme/icons';
import DefaultPageRoute from './$';
import { ArticlePage } from '../components/ArticlePage.js';
import { ComputeOptionsProvider, ThebeLoaderAndServer } from '@myst-theme/jupyter';
import type { TemplateOptions } from '../types.js';
type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: V2_MetaFunction<typeof loader> = ({ data, location }) => {
  if (!data) return [];

  const config: SiteManifest = data.config;
  const project: ManifestProject = data.project;

  return getMetaTagsForArticle({
    origin: '',
    url: location.pathname,
    title: config?.title ?? project.title,
    description: config.description ?? project.description ?? undefined,
    image: (project.thumbnailOptimized || project.thumbnail) ?? undefined,
    keywords: config.keywords ?? project.keywords ?? [],
    twitter: config?.options?.twitter,
  });
};

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ params, request }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
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
  return (
    <>
      <TopNav hideToc={hide_toc} hideSearch={hideSearch} />
      <PrimaryNavigation
        sidebarRef={toc}
        hide_toc={hide_toc}
        footer={<MadeWithMyst />}
        projectSlug={projectSlug}
      />
      <TabStateProvider>
        <article
          ref={container}
          className="article content article-grid grid-gap"
          // article does not neet to get top as it is in the page flow (z-0)
          // style={{ marginTop: top }}
        >
          {children}
        </article>
      </TabStateProvider>
    </>
  );
}

function ArticlePageAndNavigation({
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
      <ArticlePageAndNavigationInternal
        children={children}
        hide_toc={hide_toc}
        hideSearch={hideSearch}
        projectSlug={projectSlug}
        inset={inset}
      />
    </UiStateProvider>
  );
}

export default function Page() {
  const siteDesign: TemplateOptions =
    (useSiteManifest() as SiteManifest & TemplateOptions)?.options ?? {};

  const { container } = useOutlineHeight();
  const data = useLoaderData() as { page: PageLoader; project: ManifestProject };
  const baseurl = useBaseurl();
  const pageDesign: TemplateOptions = (data.page.frontmatter as any)?.site ?? {};
  const { hide_search, hide_footer_links } = {
    ...siteDesign,
    ...pageDesign,
  };
  return (
    <ArticlePageAndNavigation hide_toc hideSearch={hide_search} projectSlug={data.page.project}>
      {/* <ProjectProvider project={project}> */}
      <ProjectProvider>
        <ComputeOptionsProvider
          features={{ notebookCompute: true, figureCompute: true, launchBinder: false }}
        >
          <ThebeLoaderAndServer baseurl={baseurl}>
            <main ref={container} className="landing-page article-grid subgrid-gap col-screen">
              <ArticlePage article={data.page} hide_all_footer_links={hide_footer_links} />
            </main>
          </ThebeLoaderAndServer>
        </ComputeOptionsProvider>
      </ProjectProvider>
    </ArticlePageAndNavigation>
  );
}
