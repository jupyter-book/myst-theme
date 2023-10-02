import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import {
  Abstract,
  Bibliography,
  ContentBlocks,
  FooterLinksBlock,
  Keywords,
} from '../components/index.js';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound.js';
import { ErrorProjectNotFound } from './ErrorProjectNotFound.js';
import type { PageLoader } from '@myst-theme/common';
import { copyNode, extractPart, type GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-spec-ext';
import {
  useComputeOptions,
  ExecuteScopeProvider,
  BusyScopeProvider,
  NotebookToolbar,
  ConnectionStatusTray,
  BinderBadge,
  useCanCompute,
  ErrorTray,
} from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';

export const ArticlePage = React.memo(function ({
  article,
  hide_all_footer_links,
  showAbstract,
  hideKeywords,
}: {
  article: PageLoader;
  hide_all_footer_links?: boolean;
  showAbstract?: boolean;
  hideKeywords?: boolean;
}) {
  const canCompute = useCanCompute(article);
  const { binderBadgeUrl } = useComputeOptions();
  const { hide_title_block, hide_footer_links } = (article.frontmatter as any)?.design ?? {};

  const tree = copyNode(article.mdast);
  const keywords = article.frontmatter?.keywords ?? [];
  const abstract = showAbstract ? extractPart(tree, 'abstract') : undefined;
  // take binder url from article frontmatter or fallback to project
  const binderUrl = article.frontmatter.binder ?? binderBadgeUrl;

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider contents={article}>
          {!hide_title_block && (
            <FrontmatterBlock
              kind={article.kind}
              frontmatter={article.frontmatter}
              className="pt-5 mb-8"
            />
          )}
          {binderUrl && !canCompute && (
            <div className="flex justify-end">
              <BinderBadge binder={binderUrl} />
            </div>
          )}
          {canCompute && article.kind === SourceFileKind.Notebook && <NotebookToolbar showLaunch />}
          <ErrorTray pageSlug={article.slug} />
          <div id="skip-to-article" />
          <Abstract content={abstract as GenericParent} />
          {abstract && <Keywords keywords={keywords} hideKeywords={hideKeywords} />}
          <ContentBlocks pageKind={article.kind} mdast={tree as GenericParent} />
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
