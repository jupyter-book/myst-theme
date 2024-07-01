import React from 'react';
import { ReferencesProvider, useProjectManifest } from '@myst-theme/providers';
import {
  Bibliography,
  ContentBlocks,
  FooterLinksBlock,
  FrontmatterParts,
  BackmatterParts,
} from '../components/index.js';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound.js';
import { ErrorProjectNotFound } from './ErrorProjectNotFound.js';
import type { PageLoader } from '@myst-theme/common';
import { copyNode, type GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-spec-ext';
import {
  ExecuteScopeProvider,
  BusyScopeProvider,
  NotebookToolbar,
  ConnectionStatusTray,
  ErrorTray,
  useComputeOptions,
} from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { combineDownloads, extractKnownParts } from '../utils.js';

/**
 * @deprecated This component is not maintained, in favor of theme-specific ArticlePages
 *
 * As examples, MyST book and article themes define their own ArticlePage components.
 */
export const ArticlePage = React.memo(function ({
  article,
  hide_all_footer_links,
  hideKeywords,
}: {
  article: PageLoader;
  hide_all_footer_links?: boolean;
  hideKeywords?: boolean;
}) {
  const manifest = useProjectManifest();
  const compute = useComputeOptions();

  const { hide_title_block, hide_footer_links } = (article.frontmatter as any)?.options ?? {};
  const downloads = combineDownloads(manifest?.downloads, article.frontmatter);
  const tree = copyNode(article.mdast);
  const keywords = article.frontmatter?.keywords ?? [];
  const parts = extractKnownParts(tree);

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={compute?.enabled ?? false} contents={article}>
          {!hide_title_block && (
            <FrontmatterBlock
              kind={article.kind}
              frontmatter={{ ...article.frontmatter, downloads }}
              className="pt-5 mb-8"
            />
          )}
          {compute?.enabled &&
            compute.features.notebookCompute &&
            article.kind === SourceFileKind.Notebook && <NotebookToolbar showLaunch />}
          {compute?.enabled && article.kind === SourceFileKind.Article && (
            <ErrorTray pageSlug={article.slug} />
          )}
          <div id="skip-to-article" />
          <FrontmatterParts parts={parts} keywords={keywords} hideKeywords={hideKeywords} />
          <ContentBlocks pageKind={article.kind} mdast={tree as GenericParent} />
          <BackmatterParts parts={parts} />
          <Bibliography />
          <ConnectionStatusTray />
          {!hide_footer_links && !hide_all_footer_links && (
            <FooterLinksBlock links={article.footer} />
          )}
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
});

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
