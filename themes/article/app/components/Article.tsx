import { type PageLoader } from '@myst-theme/common';
import {
  Bibliography,
  DocumentOutline,
  SupportingDocuments,
  FrontmatterParts,
  BackmatterParts,
  extractKnownParts,
  Footnotes,
} from '@myst-theme/site';
import React from 'react';
import {
  ErrorTray,
  NotebookToolbar,
  useComputeOptions,
  BusyScopeProvider,
  ConnectionStatusTray,
  ExecuteScopeProvider,
} from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import {
  ArticleProvider,
  useThemeTop,
  useMediaQuery,
  useProjectManifest,
} from '@myst-theme/providers';
import type { GenericParent } from 'myst-common';
import { copyNode } from 'myst-common';
import { SourceFileKind } from 'myst-spec-ext';
import { MyST } from 'myst-to-react';

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
  const manifest = useProjectManifest();
  const keywords = article.frontmatter?.keywords ?? [];
  const tree = copyNode(article.mdast);
  const parts = extractKnownParts(tree, article.frontmatter?.parts);
  const { title, subtitle } = article.frontmatter;
  const compute = useComputeOptions();
  const top = useThemeTop();
  const isOutlineMargin = useMediaQuery('(min-width: 1024px)');

  const { thebe } = manifest as any;
  const { location } = article;
  return (
    <ArticleProvider
      kind={article.kind}
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={compute?.enabled ?? false} contents={article}>
          {!hideTitle && (
            <FrontmatterBlock
              frontmatter={{ title, subtitle }}
              thebe={thebe}
              location={location}
              className="mb-5"
            />
          )}
          {!hideOutline && (
            <div
              className="block my-10 lg:sticky lg:top-0 lg:z-10 lg:h-0 lg:pt-0 lg:my-0 lg:ml-10 lg:col-margin-right"
              style={{ top: top + TOP_OFFSET }}
            >
              <DocumentOutline
                className="relative pt-[2px]"
                maxdepth={outlineMaxDepth}
                isMargin={isOutlineMargin}
                title="In this article"
              >
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
          <MyST ast={tree.children as GenericParent[]} />
          <BackmatterParts parts={parts} />
          <Footnotes />
          <Bibliography />
          <ConnectionStatusTray />
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ArticleProvider>
  );
}
