import { type PageLoader } from '@myst-theme/common';
import {
  Bibliography,
  ContentBlocks,
  DocumentOutline,
  SupportingDocuments,
  FrontmatterParts,
  BackmatterParts,
  extractKnownParts,
} from '@myst-theme/site';
import { ErrorTray, NotebookToolbar, useComputeOptions } from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { ReferencesProvider } from '@myst-theme/providers';
import type { GenericParent } from 'myst-common';
import { copyNode } from 'myst-common';
import { BusyScopeProvider, ConnectionStatusTray, ExecuteScopeProvider } from '@myst-theme/jupyter';
import { SourceFileKind } from 'myst-spec-ext';

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
  const parts = extractKnownParts(tree);
  const { title, subtitle } = article.frontmatter;
  const compute = useComputeOptions();

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={compute?.enabled ?? false} contents={article}>
          {!hideTitle && <FrontmatterBlock frontmatter={{ title, subtitle }} className="mb-5" />}
          {!hideOutline && (
            <div className="sticky top-0 z-10 hidden h-0 pt-2 ml-10 col-margin-right lg:block">
              <DocumentOutline className="relative">
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
          <Bibliography />
          <ConnectionStatusTray />
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
}
