import { type PageLoader } from '@myst-theme/common';
import {
  Bibliography,
  ContentBlocks,
  DocumentOutline,
  SupportingDocuments,
  FrontmatterParts,
  BackmatterParts,
  extractKnownParts,
  Footnotes,
} from '@myst-theme/site';
import { ErrorTray, NotebookToolbar, useComputeOptions } from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { ReferencesProvider, useThemeTop } from '@myst-theme/providers';
import type { GenericParent } from 'myst-common';
import { copyNode } from 'myst-common';
import { BusyScopeProvider, ConnectionStatusTray, ExecuteScopeProvider } from '@myst-theme/jupyter';
import { SourceFileKind } from 'myst-spec-ext';

const TOP_OFFSET = 24;

export function Article({
  article,
  hideKeywords,
  hideOutline,
  hideTitle,
  outlineMaxDepth,
}: {
  article: PageLoader;
  hideKeywords?: boolean;
  hideOutline?: boolean;
  hideTitle?: boolean;
  outlineMaxDepth?: number;
}) {
  const keywords = article.frontmatter?.keywords ?? [];
  const tree = copyNode(article.mdast);
  const parts = extractKnownParts(tree);
  const { title, subtitle } = article.frontmatter;
  const compute = useComputeOptions();
  const top = useThemeTop();

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={compute?.enabled ?? false} contents={article}>
          {!hideTitle && <FrontmatterBlock frontmatter={{ title, subtitle }} className="mb-5" />}
          {!hideOutline && (
            <div
              className="block my-10 lg:sticky lg:top-0 lg:z-10 lg:h-0 lg:pt-0 lg:my-0 lg:ml-10 lg:col-margin-right"
              style={{ top: top + TOP_OFFSET }}
            >
              <DocumentOutline className="relative pt-[2px]" maxdepth={outlineMaxDepth}>
                <SupportingDocuments />
              </DocumentOutline>
            </div>
          )}

          {compute?.enabled &&
            compute?.features.notebookCompute &&
            article.kind === SourceFileKind.Notebook && <NotebookToolbar showLaunch />}
          <ErrorTray pageSlug={article.slug} />
          <div id="skip-to-article" />
          <FrontmatterParts parts={parts} keywords={keywords} hideKeywords={hideKeywords} />
          <ContentBlocks mdast={tree as GenericParent} />
          <BackmatterParts parts={parts} />
          <Footnotes />
          <Bibliography />
          <ConnectionStatusTray />
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
}
