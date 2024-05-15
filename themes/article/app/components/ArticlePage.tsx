import type { PageLoader } from '@myst-theme/common';
import {
  FooterLinksBlock,
  ArticleHeader,
  Error404,
} from '@myst-theme/site';
import { LaunchBinder, useComputeOptions } from '@myst-theme/jupyter';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import type { SiteManifest } from 'myst-config';
import {
  ReferencesProvider,
  useBaseurl,
  useGridSystemProvider,
  useLinkProvider,
  useSiteManifest,
} from '@myst-theme/providers';
import classNames from 'classnames';
import { BusyScopeProvider, ExecuteScopeProvider } from '@myst-theme/jupyter';
import { DownloadLinksArea } from './Downloads';
import { Article } from './Article';
import type { TemplateOptions } from '../types.js';

export function ArticlePage({ article }: { article: PageLoader }) {
  const grid = useGridSystemProvider();

  const siteManifest = useSiteManifest() as SiteManifest;
  const pageDesign: TemplateOptions = (article.frontmatter as any)?.options ?? {};
  const siteDesign: TemplateOptions = siteManifest?.options ?? {};

  const { projects } = siteManifest;
  const { hide_footer_links, hide_outline, outline_maxdepth } = {
    ...siteDesign,
    ...pageDesign,
  };
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const compute = useComputeOptions();
  const project = projects?.[0];
  const isIndex = article.slug === project?.index;

  if (!project) return <Error404 />;

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={compute?.enabled ?? false} contents={article}>
          <ArticleHeader frontmatter={project}>
            <div className="pt-5 md:self-center h-fit lg:pt-0 col-body lg:col-margin-right-inset">
              <DownloadLinksArea />
              {compute?.enabled && compute.features.launchBinder && (
                <div className="col-margin mt-3 mx-5 lg:mt-2 lg:mx-0 lg:w-[300px]">
                  <div className="flex flex-wrap gap-2 lg:flex-col w-[147px] pl-[1px] lg:mx-auto">
                    <LaunchBinder type="link" location={article.location} />
                  </div>
                </div>
              )}
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
                    className="self-center flex-none transition-transform group-hover:-translate-x-1"
                  />
                  <span>Back to Article</span>
                </Link>
                <div className="flex-grow text-center">{article.frontmatter.title}</div>
                {compute?.enabled && compute.features.launchBinder && (
                  <div className="mr-2">
                    <LaunchBinder type="button" location={article.location} />
                  </div>
                )}
                <a
                  href={article.frontmatter?.exports?.[0]?.url}
                  className="flex gap-1 px-2 py-1 font-normal no-underline border rounded bg-slate-200 border-slate-600 hover:bg-slate-800 hover:text-white hover:border-transparent"
                >
                  <DocumentArrowDownIcon
                    width="1rem"
                    height="1rem"
                    className="self-center flex-none transition-transform group-hover:-translate-x-1"
                  />
                  <span>Download {article.kind}</span>
                </a>
              </div>
            )}
            <Article
              article={article}
              hideKeywords={!isIndex}
              hideTitle={isIndex}
              hideOutline={hide_outline}
              outlineMaxDepth={outline_maxdepth}
            />
          </main>
          {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
}

